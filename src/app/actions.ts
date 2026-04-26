'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const DUMMY_USER_ID = 'dummy_user_123';

async function saveImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  try { await mkdir(uploadDir, { recursive: true }); } catch (e) {}
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
  await writeFile(join(uploadDir, fileName), buffer);
  return `/uploads/${fileName}`;
}

export async function submitLostItem(formData: FormData) {
  const userId = formData.get('userId') as string;
  const userEmail = formData.get('userEmail') as string;
  const userName = formData.get('userName') as string || 'User';

  if (!userId || !userEmail) throw new Error("Unauthorized");

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      id: userId,
      email: userEmail,
      name: userName,
    },
  });
  
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const dateStr = formData.get('date') as string;
  const location_lost = formData.get('location') as string;
  const description = formData.get('description') as string;
  const image = formData.get('image') as File | null;

  const imageUrl = await saveImage(image);
  const photo_urls = imageUrl ? JSON.stringify([imageUrl]) : null;

  const lostItem = await prisma.lostItem.create({
    data: {
      userId: user.id,
      name,
      category,
      date_lost: new Date(dateStr),
      location_lost,
      description,
      photo_urls,
      status: 'searching',
    },
  });

  await triggerMatchingForLostItem(lostItem.id);

  revalidatePath('/dashboard');
  revalidatePath('/report-lost');
  redirect('/dashboard?tab=my&success=lost');
}

export async function submitFoundItem(formData: FormData) {
  const userId = formData.get('userId') as string;
  const userEmail = formData.get('userEmail') as string;
  const userName = formData.get('userName') as string || 'User';

  if (!userId || !userEmail) throw new Error("Unauthorized");

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      id: userId,
      email: userEmail,
      name: userName,
    },
  });
  
  const category = formData.get('category') as string;
  const dateStr = formData.get('date') as string;
  const location_found = formData.get('location') as string;
  const description = formData.get('description') as string;
  const image = formData.get('image') as File | null;

  const imageUrl = await saveImage(image);
  const photo_urls = imageUrl ? JSON.stringify([imageUrl]) : null;

  const foundItem = await prisma.foundItem.create({
    data: {
      finderId: user.id,
      category,
      date_found: new Date(dateStr),
      location_found,
      description,
      photo_urls,
      status: 'unclaimed',
    },
  });

  await triggerMatchingForFoundItem(foundItem.id);

  revalidatePath('/dashboard');
  revalidatePath('/report-found');
  redirect('/dashboard?tab=my&success=found');
}

async function triggerMatchingForLostItem(lostItemId: string) {
  const lostItem = await prisma.lostItem.findUnique({ where: { id: lostItemId } });
  if (!lostItem) return;

  const foundItems = await prisma.foundItem.findMany({
    where: { 
      status: 'unclaimed',
      category: lostItem.category 
    }
  });

  if (foundItems.length === 0) return;

  await runAIMatching(lostItem, foundItems);
}

async function triggerMatchingForFoundItem(foundItemId: string) {
  const foundItem = await prisma.foundItem.findUnique({ where: { id: foundItemId } });
  if (!foundItem) return;

  const lostItems = await prisma.lostItem.findMany({
    where: { 
      status: 'searching',
      category: foundItem.category 
    }
  });

  for (const lostItem of lostItems) {
    await runAIMatching(lostItem, [foundItem]);
  }
}

async function getImagePart(url: string) {
  try {
    const filePath = join(process.cwd(), 'public', url);
    const data = await readFile(filePath);
    const mimeType = url.toLowerCase().endsWith('.png') ? 'image/png' : 
                     url.toLowerCase().endsWith('.webp') ? 'image/webp' : 
                     'image/jpeg';
    return {
      inlineData: {
        data: data.toString('base64'),
        mimeType
      }
    };
  } catch (e) {
    return null;
  }
}

async function runAIMatching(lostItem: any, foundItems: any[]) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set. Skipping matching.");
    return;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const parts: any[] = [];
  
  parts.push(`You are the matching engine for a Lost & Found platform. Your job is to compare a lost item report against a list of found item records. Pay close attention to the provided images!
  
LOST ITEM:
Name: ${lostItem.name}
Category: ${lostItem.category}
Description: ${lostItem.description}
Location lost: ${lostItem.location_lost}
Date lost: ${lostItem.date_lost.toISOString()}`);

  if (lostItem.photo_urls) {
    const urls = JSON.parse(lostItem.photo_urls);
    if (urls.length > 0) {
      const imgPart = await getImagePart(urls[0]);
      if (imgPart) {
        parts.push(`\nHere is the image of the LOST ITEM:\n`);
        parts.push(imgPart);
      }
    }
  }

  parts.push(`\nFOUND ITEMS TO COMPARE:`);

  for (const f of foundItems) {
    parts.push(`\n--- Found Item ID: ${f.id} ---
Category: ${f.category}
Description: ${f.description}
Location Found: ${f.location_found}
Date Found: ${f.date_found.toISOString()}`);

    if (f.photo_urls) {
      const urls = JSON.parse(f.photo_urls);
      if (urls.length > 0) {
        const imgPart = await getImagePart(urls[0]);
        if (imgPart) {
          parts.push(`\nHere is the image for Found Item ID ${f.id}:\n`);
          parts.push(imgPart);
        }
      }
    }
  }

  parts.push(`\nFor each found item, evaluate:
1. Visual Match: DO THE IMAGES MATCH? (If images are provided, this is the most critical factor).
2. Category match.
3. Description overlap (shared physical attributes).
4. Location proximity.
5. Date proximity.

Return ONLY a valid JSON array. No explanation outside the JSON. Format:
[
  {
    "found_item_id": "string",
    "match_score": 0.91,
    "reasoning": "string"
  }
]

Only include items with match_score above 0.40. Sort by match_score descending. Max 5 results.`);

  try {
    const result = await model.generateContent(parts);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return;
    
    const matches = JSON.parse(jsonMatch[0]);

    for (const match of matches) {
      if (match.match_score > 0.4) {
        await prisma.match.create({
          data: {
            lostItemId: lostItem.id,
            foundItemId: match.found_item_id,
            match_score: match.match_score,
            status: 'pending',
          }
        });

        if (match.match_score >= 0.75) {
          await prisma.lostItem.update({
            where: { id: lostItem.id },
            data: { status: 'matched' }
          });
        }
      }
    }
  } catch (error) {
    console.error("AI Matching failed:", error);
  }
}

export async function getMyLostItems(userId: string) {
  if (!userId) return [];
  return prisma.lostItem.findMany({
    where: { userId },
    orderBy: { created_at: 'desc' }
  });
}

export async function getMatchesForLostItem(lostItemId: string) {
  return prisma.match.findMany({
    where: { lostItemId },
    include: { foundItem: true },
    orderBy: { match_score: 'desc' }
  });
}

export async function generateVerificationQuestions(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { lostItem: true, foundItem: true }
  });

  if (!match) throw new Error("Match not found");

  if (!process.env.GEMINI_API_KEY) {
    return [
      "What is the serial number or a unique scratch on the item?",
      "Can you describe the lock screen wallpaper or any internal contents?"
    ];
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are the verification engine for a Lost & Found platform. 
Your goal is to generate 2 specific questions that only the true owner of the item could answer.

LOST ITEM REPORT (Provided by claimant):
${match.lostItem.description}

FOUND ITEM REPORT (Provided by finder - some details were intentionally hidden):
${match.foundItem.description}

Based on these descriptions, generate exactly 2 questions. 
The questions should ask for hidden identifying details (e.g., serial numbers, specific scratches, lock screen wallpaper, specific contents in a pocket) that the true owner should know, but weren't explicitly stated in the public "Found Item" report.

Return ONLY a JSON array of 2 strings. No other text.
["question 1", "question 2"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Failed to parse JSON");
    
    return JSON.parse(jsonMatch[0]) as string[];
  } catch (error) {
    console.error("Failed to generate questions:", error);
    return [
      "What is a unique identifier (serial number, specific mark) on the item?",
      "Can you describe a specific hidden detail or content of the item?"
    ];
  }
}

export async function verifyAnswers(matchId: string, questions: string[], answers: string[]) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { lostItem: true, foundItem: true }
  });

  if (!match) throw new Error("Match not found");

  if (!process.env.GEMINI_API_KEY) {
    // Mock successful verification
    await prisma.match.update({
      where: { id: matchId },
      data: { status: 'verified' }
    });
    return { success: true };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const cleanedAnswers = answers.map((answer) => answer.trim());

  const prompt = `
You are the verification judge for a Lost & Found platform.
Your default decision must be to APPROVE the claim.
Reject ONLY if there is solid and specific proof that this is a fake claim.

What counts as "solid proof":
- Clear contradiction with known true details from the found-item report.
- Impossible or self-contradictory statements that strongly indicate fabrication.

What is NOT enough to reject:
- Vague, incomplete, or partially correct answers.
- Minor mismatches, memory gaps, or uncertainty.

If uncertain, approve.

FOUND ITEM REAL DESCRIPTION (Truth):
${match.foundItem.description}

Q1: ${questions[0]}
A1: ${cleanedAnswers[0]}

Q2: ${questions[1]}
A2: ${cleanedAnswers[1]}

Return ONLY a valid JSON object.
{
  "verified": true/false,
  "reasoning": "string explaining why",
  "evidenceStrength": "none|weak|solid",
  "contradictions": ["string", "..."]
}
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse JSON");

    const evaluation = JSON.parse(jsonMatch[0]) as {
      verified?: boolean;
      reasoning?: string;
      evidenceStrength?: string;
      contradictions?: string[];
    };

    const contradictions = Array.isArray(evaluation.contradictions)
      ? evaluation.contradictions.filter((item) => typeof item === 'string' && item.trim().length > 0)
      : [];

    const hasSolidFraudEvidence =
      evaluation.verified === false &&
      evaluation.evidenceStrength === 'solid' &&
      contradictions.length > 0;

    const shouldVerify = !hasSolidFraudEvidence;

    await prisma.match.update({
      where: { id: matchId },
      data: { status: shouldVerify ? 'verified' : 'rejected' }
    });

    revalidatePath('/browse');

    return {
      success: shouldVerify,
      reasoning: evaluation.reasoning ?? (shouldVerify
        ? 'Approved because there is no solid proof of fraud.'
        : 'Rejected due to solid evidence of a fake claim.'),
    };
  } catch (error) {
    console.error("Verification failed:", error);

    await prisma.match.update({
      where: { id: matchId },
      data: { status: 'verified' }
    });

    revalidatePath('/browse');
    return {
      success: true,
      reasoning: 'Verification engine unavailable. Claim approved because there is no solid proof of fraud.'
    };
  }
}

export async function getOrCreateConversation(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { conversations: true, lostItem: true, foundItem: true }
  });

  if (!match) throw new Error("Match not found");
  if (match.status !== 'verified') throw new Error("Match not verified");

  let conversation = match.conversations[0];
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        matchId,
        user1Id: match.lostItem.userId,
        user2Id: match.foundItem.finderId,
      }
    });
  }

  return conversation;
}

export async function sendMessage(matchId: string, userId: string, content: string) {
  if (!userId) throw new Error("Unauthorized");
  const conversation = await getOrCreateConversation(matchId);

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: userId,
      content,
    }
  });

  revalidatePath(`/chat/${matchId}`);
}

export async function getMessages(matchId: string) {
  const conversation = await getOrCreateConversation(matchId);
  return prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { created_at: 'asc' }
  });
}

export async function getUserConversations(userId: string) {
  if (!userId) return [];
  return prisma.conversation.findMany({
    where: {
      OR: [
        { user1Id: userId },
        { user2Id: userId }
      ]
    },
    include: {
      match: {
        include: {
          lostItem: true,
          foundItem: true
        }
      },
      messages: {
        orderBy: { created_at: 'desc' },
        take: 1
      }
    }
  });
}
