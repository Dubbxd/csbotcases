import prisma from './client';
import { Rarity, ItemType } from '@prisma/client';

/**
 * Seed the database with real CS2 cases
 * Based on actual CS2 drop rates and case contents
 */

// CS2 Actual Drop Rates (based on community research)
const CS2_DROP_RATES = {
  // Consumer Grade (Gray) - not in cases
  COMMON: 0,
  // Mil-Spec (Blue)  
  UNCOMMON: 0.7992,       // 79.92%
  // Restricted (Purple)
  RARE: 0.1598,           // 15.98%
  // Classified (Pink)
  VERY_RARE: 0.032,       // 3.20%
  // Covert (Red)
  LEGENDARY: 0.0064,      // 0.64%
  // Knives/Gloves (Gold)
  EXOTIC: 0.0026,         // 0.26% (EXTRA RARE!)
};

async function seedCS2Cases() {
  console.log('🎮 Seeding CS2 Real Cases...\n');

  // ============================================
  // CREAR KEY DEFINITION PRIMERO
  // ============================================
  console.log('🔑 Creating Universal Key...');
  await prisma.keyDefinition.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Universal Key',
      description: 'Can open any case',
    },
  });
  console.log('✅ Universal Key created!\n');

  // ============================================
  // CASE 1: Dreams & Nightmares Case (ID FIJO: 1)
  // ============================================
  console.log('📦 Creating Dreams & Nightmares Case...');
  
  const dreamsCase = await prisma.caseDefinition.create({
    data: {
      id: 1, // ID FIJO
      name: 'Dreams & Nightmares Case',
      description: 'Community-designed skins from the Dreams & Nightmares contest',
      iconUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DAQ1h3LAVbv6mxFABs3OXNYgJR_Nm1nYGHnuTgDL_ehG5u5Mx2gv2P9NWtiQzlqRBrYWHyLdDAIQ5rZgnR-1boxefxxcjrPZVb2Ww/256fx256f',
      collection: 'Dreams & Nightmares',
    },
  });

  // Create drop probability tables (CS2 accurate rates!)
  await prisma.caseDropTable.createMany({
    data: [
      { caseId: dreamsCase.id, rarity: 'UNCOMMON', probability: CS2_DROP_RATES.UNCOMMON },     // 79.92% Mil-Spec (Blue)
      { caseId: dreamsCase.id, rarity: 'RARE', probability: CS2_DROP_RATES.RARE },             // 15.98% Restricted (Purple)
      { caseId: dreamsCase.id, rarity: 'VERY_RARE', probability: CS2_DROP_RATES.VERY_RARE },   // 3.20% Classified (Pink)
      { caseId: dreamsCase.id, rarity: 'LEGENDARY', probability: CS2_DROP_RATES.LEGENDARY },   // 0.64% Covert (Red)
      { caseId: dreamsCase.id, rarity: 'EXOTIC', probability: CS2_DROP_RATES.EXOTIC },         // 0.26% KNIVES!
    ],
  });

  // Dreams & Nightmares - Mil-Spec (Blue) 79.92%
  const dreamsMilSpec = [
    { weapon: 'MP9', skin: 'Starlight Protector', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6r8FA957ODYfi9W9c6JmImMn-O6N--DzjgCvMFw2uvF9I2t2Vey80VrYG-mJ9CVJFU6N1_Q-1C8wL3njZG_vZzOzHpgvCJw5X7byhXk1E9EbLU7hPSACQLJ1aWmhIY/256fx256f' },
    { weapon: 'MAG-7', skin: 'Insomnia', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou7uifDhh3szcdD4T09-kjZOflvn9DLfYkWNFppJy3-2ZoI6gjVfi-EdsYDqgJoKVJAI3Yw7S_1C_le7p1pK975nJnSEy7yJw4CqIm0C_1ktIZ7c-0_ScQQbfGJbWU_A/256fx256f' },
    { weapon: 'MP7', skin: 'Abyssal Apparition', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6v7Ihh0w9DTfjFN09C5hIWZh8jiPLDDhm5D18d0i_rVyoD0mlOx5Uo-Yjv3JoOXIw4_NAnZ_li4wbrm1pS4vpSbyyRqviAht3yPlhKzhx8YPOBp0_XJUwXAQffcHu0wWMg/256fx256f' },
    { weapon: 'Dual Berettas', skin: 'Melondrama', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpos7asPwJf1OD3cicVueOihoWKk8j4OrzZgiUGupUl0u2R84-higTmqUptZTvxI9WQdAE3NAvV-la8k-fxxcjrxiV-rGw/256fx256f' },
    { weapon: 'G3SG1', skin: 'Dream Glade', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposem2LFZf1OD3dm5R642JqImKhfDLPr7Vn35cpp0l2-qTp9qu21e1-kdoYTv6dtTHIAE2Z1nS-QK-wO_vhZW4vJuYzCBl7ikq5irZlAv330-VO1AqVw/256fx256f' },
    { weapon: 'PPBizon', skin: 'Space Cat', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLO_JAlf0v73cCxX7eOwmIWInOTLPr7Vn35cpp1y2rvAoYmm2Qe1-kduNm37coXDdQRqZFrY-QK9we_u0ZC-u8ybzSdk7igl4SvclBKxhk0YOOVhgvfMHBHbVPYeX_1dTFo/256fx256f' },
    { weapon: 'XM1014', skin: 'Zombie Offensive', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgporrf0e1Y07ODYTjVX09m7h4WYm_LLP7LWnn8fvJMliLzA996s2gW2_ktuYjr1JoWWdQQ3YFrXrFC7wejujJTq78zAziNmuT5iuyhL8xCJGA/256fx256f' },
  ];

  // Dreams & Nightmares - Restricted (Purple) 15.98%
  const dreamsRestricted = [
    { weapon: 'USP-S', skin: 'Ticket to Hell', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ09-jq5WYh8j_OrfdqWdQ-sJ0teXI8oTht1i1uRQ5fT30IYCUIwU4MwvT-QDqxOa61pK1ot2XnjXlHDVT/256fx256f' },
    { weapon: 'FAMAS', skin: 'Rapid Eye Movement', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposLuoKhRf1OD3dzxP7c-Jh5C0m_7zO6-fkjMIvpEkj7iVotmliwC3-UVqNTyhI4DHdgdoN1iF-AS2w-y615K1ot2XnjLdm0Hg/256fx256f' },
    { weapon: 'MP5-SD', skin: 'Necro Jr.', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6rwOANf1OD3cicVueOihoWKk8j5Nr_Yg2YfvsN327-WrYmnjFft_kFrYzqiJoSXcFQ-Zw7R_1Dqk-3og5W4v53Py3U17Sgi7H6Pzha3iU0bbeZugvPMHBHblIf6UQ0/256fx256f' },
    { weapon: 'Sawed-Off', skin: 'Spirit Board', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopbuyLgNv1fX3eSR9-t2kk4-fqPv9NLPF2G4HscQm0r_D8I2t0Ae2-EQ5YGqhd9CWdlI6MFyC8lDqk7zqgJa_6prMzXY17CQmsHrfmwv3308_8mR5Rw/256fx256f' },
    { weapon: 'Galil AR', skin: 'Destroyer', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbupIgthwczLZAJF7dC_mL-HnvD8J_XXzzsCvpUp2bqY9I3w0ALkqEBqZWmnJIWUIVJsYw6Fq1PrxrvthpO1u52cziBrvXQi4WGdwUK3TgHUNg/256fx256f' },
  ];

  // Dreams & Nightmares - Classified (Pink) 3.20%
  const dreamsClassified = [
    { weapon: 'M4A1-S', skin: 'Night Terror', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uOxh7-Gw_alDLjQhH9U18lwmO7Eu9Sk0ADk_kU9Mmv3LIbBJ1U2Z1DZ-1K-lOjohsS46Zqaznphvj5iuyhgMx3xGA/256fx256f' },
    { weapon: 'SSG 08', skin: 'Parallax', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopamie19f0Ob3Yi5FvISJkIGZhPv4O6Xuk3lu5Mx2gv2P8Yit2wO2_BY9YTr3IdeWIVI_Yl2F_wC-wezs0Je6756dzHpjvSZx4XePl0HmhwYMMLLgCz4YvQ/256fx256f' },
    { weapon: 'AK-47', skin: 'Nightwish', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV0966m4-PhOf7Ia_ummJW4NE_0r-ZoNii2Fbk-kdkZWCnddLHcVU9aFvW_VO5l-i8hsPu6Z6dnCQ3vCZ24XmMlgv330--RCSE9Q/256fx256f' },
  ];

  // Dreams & Nightmares - Covert (Red) 0.64%
  const dreamsCovert = [
    { weapon: 'AWP', skin: 'Duality', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwOq7cqWZU7Mxkh6eQrdX3jQW2_0o9YWHyI4OcIQY5NFGCqFi6w-rn1Je-6pmdznpmvXIn5HqMnBLm0h4eP7FugfHNRFbLUPoZQe8_gEvSUrJEUQ/256fx256f' },
    { weapon: 'MP9', skin: 'Starlight Protector', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6r8FA957ODYfi9W9c6JmImMn-O6N--DzjgCvMFw2uvF9I2t2Vey80VrYG-mJ9CVJFU6N1_Q-1C8wL3njZG_vZzOzHpgvCJw5X7byhXk1E9EbLU7hPSACQLJ1aWmhIY/256fx256f' },
  ];

  // Create all items for Dreams & Nightmares
  console.log('  → Creating items...');
  
  for (const item of dreamsMilSpec) {
    const itemDef = await prisma.itemDefinition.create({
      data: {
        name: `${item.weapon} | ${item.skin}`,
        type: 'WEAPON' as ItemType,
        rarity: 'UNCOMMON' as Rarity,
        weapon: item.weapon,
        skin: item.skin,
        iconUrl: item.imageUrl,
        description: `Mil-Spec (Blue) from Dreams & Nightmares case`,
        
        
      },
    });

    await prisma.caseDropItem.create({
      data: {
        caseId: dreamsCase.id,
        itemDefId: itemDef.id,
        rarity: 'UNCOMMON',
        weight: 1.0,
      },
    });
  }

  for (const item of dreamsRestricted) {
    const itemDef = await prisma.itemDefinition.create({
      data: {
        name: `${item.weapon} | ${item.skin}`,
        type: 'WEAPON' as ItemType,
        rarity: 'UNCOMMON' as Rarity,
        weapon: item.weapon,
        skin: item.skin,
        iconUrl: item.imageUrl,
        description: `Restricted (Purple) from Dreams & Nightmares case`,
        
        
      },
    });

    await prisma.caseDropItem.create({
      data: {
        caseId: dreamsCase.id,
        itemDefId: itemDef.id,
        rarity: 'RARE',
        weight: 1.0,
      },
    });
  }

  for (const item of dreamsClassified) {
    const itemDef = await prisma.itemDefinition.create({
      data: {
        name: `${item.weapon} | ${item.skin}`,
        type: 'WEAPON' as ItemType,
        rarity: 'LEGENDARY' as Rarity,
        weapon: item.weapon,
        skin: item.skin,
        iconUrl: item.imageUrl,
        description: `Classified (Pink) from Dreams & Nightmares case`,
        
        
      },
    });

    await prisma.caseDropItem.create({
      data: {
        caseId: dreamsCase.id,
        itemDefId: itemDef.id,
        rarity: 'VERY_RARE',
        weight: 1.0,
      },
    });
  }

  for (const item of dreamsCovert) {
    const itemDef = await prisma.itemDefinition.create({
      data: {
        name: `${item.weapon} | ${item.skin}`,
        type: 'WEAPON' as ItemType,
        rarity: 'LEGENDARY' as Rarity,
        weapon: item.weapon,
        skin: item.skin,
        iconUrl: item.imageUrl,
        description: `Covert (Red) from Dreams & Nightmares case`,
        
        
      },
    });

    await prisma.caseDropItem.create({
      data: {
        caseId: dreamsCase.id,
        itemDefId: itemDef.id,
        rarity: 'LEGENDARY',
        weight: 1.0,
      },
    });
  }

  // Add Knives (EXOTIC - 0.26% chance!)
  console.log('  → Adding rare knives...');
  const knives = [
    { name: 'Karambit', skin: 'Fade', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20k_jkI7fUhFRd4cJ5nqfA9Iqs3AHs_hY-Yz32ItKUIwU4N1vZ8lC3x-rshJS97Z7PySE16yI8pSGK9mhM_zE/256fx256f' },
    { name: 'Butterfly Knife', skin: 'Doppler', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4iOluHtfeqJwW4IuJMkj7_F9Nys3lLh-hBsam30ctOTdFI3MgnZ-QC7xui71pK76pnJn3Fh7iEgsGGdwUI0kC9zNw/256fx256f' },
    { name: 'M9 Bayonet', skin: 'Gamma Doppler', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-Kms7wDLjemXlu5Mx2gv2PoI322wLjrUJvZmHwJ9KRdQQ-YV3YqAW6w-zxxcjrGjdJsxc/256fx256f' },
  ];

  for (const knife of knives) {
    const itemDef = await prisma.itemDefinition.create({
      data: {
        name: `★ ${knife.name} | ${knife.skin}`,
        type: 'WEAPON' as ItemType,
        rarity: 'EXOTIC' as Rarity,
        weapon: knife.name,
        skin: knife.skin,
        iconUrl: knife.imageUrl,
        description: `★ Rare Special Item from Dreams & Nightmares case`,
        
        
      },
    });

    await prisma.caseDropItem.create({
      data: {
        caseId: dreamsCase.id,
        itemDefId: itemDef.id,
        rarity: 'EXOTIC',
        weight: 1.0,
      },
    });
  }

  console.log(`✅ Dreams & Nightmares Case created with ${dreamsMilSpec.length + dreamsRestricted.length + dreamsClassified.length + dreamsCovert.length + knives.length} items\n`);

  // ============================================
  // ============================================
  // CASE 2: Chroma 3 Case (ID FIJO: 2)
  // ============================================
  console.log('📦 Creating Chroma 3 Case...');
  
  const chromaCase = await prisma.caseDefinition.create({
    data: {
      id: 2, // ID FIJO
      name: 'Chroma 3 Case',
      description: 'Contains one of the following community-designed weapon finishes',
      iconUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DAQ1h3LAVbv6mxFABs3OXNYgJR_Nm1nYGHnuTgDLfYhFRd4cJ5ntbN_Iv9nBrh8kFuMTz1IYadJANoMFzX-1O6kOi5gsC-6J-dy3Bh6z5iuyiCDRCDpA/256fx256f',
      collection: 'Chroma 3',
    },
  });

  // Create drop probability tables
  await prisma.caseDropTable.createMany({
    data: [
      { caseId: chromaCase.id, rarity: 'UNCOMMON', probability: CS2_DROP_RATES.UNCOMMON },
      { caseId: chromaCase.id, rarity: 'RARE', probability: CS2_DROP_RATES.RARE },
      { caseId: chromaCase.id, rarity: 'VERY_RARE', probability: CS2_DROP_RATES.VERY_RARE },
      { caseId: chromaCase.id, rarity: 'LEGENDARY', probability: CS2_DROP_RATES.LEGENDARY },
      { caseId: chromaCase.id, rarity: 'EXOTIC', probability: CS2_DROP_RATES.EXOTIC },
    ],
  });

  const chromaMilSpec = [
    { weapon: 'CZ75-Auto', skin: 'Red Astor', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotaDyfgZf1OD3cicVueOihoWKk8j_OrXummJW4NE_2LmUrYnw0Ffj-kI6YWCnINLHdQA8NwzV8lO7wevvhMPpupqfyyQ3vHRzsCuJmEXniE9PZeMx0v_JTliAVKJJH_sv26LaZOm1/256fx256f' },
    { weapon: 'P250', skin: 'Asiimov', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopujwezhjxszYI2gS09-5lpKKqPrxN7LEm1Rd6dd2j6eQ9N2t3wK3rhFoZGjxddSQdVQ3MFrU_AO5we-605bpu5_Mn3RjsyQi-z-DyLu12Nua/256fx256f' },
    { weapon: 'Galil AR', skin: 'Orange DDPAT', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbupIgthwczLZAJF7dC_mL-HnvD8J_WJlDMCucQi2LzH89XwigW3_RE9Yj37cNWTdAY7aQmE_FC5k-zs1pG4u52fzHU26Cdy4yzYnBzhiBlFbrA4haveFwtXKr2aQQ/256fx256f' },
    { weapon: 'M249', skin: 'Spectre', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-jxcjhzw8zSdD9Q7d-3mb-HnvD8J_XTkm0JuJcp3-qYpYrz21ew_Bc9NWzycoLGJFJraFnY-QK2xO--0se9uM_AzXQwuCEh5XnVnxTl1BgZaOFohPHNH1bLVfcbD_MvL-Y/256fx256f' },
    { weapon: 'Sawed-Off', skin: 'Fubar', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopbuyLgNv1fX3eSR9-t2kk4-fqPv9NLPF2DhQ7sMl2L-YpNqkiADi-0RqMDumJIKcIw43ZA6F_VXqlOy6gMC76prInSR9-n51yFNb8Bg/256fx256f' },
  ];

  const chromaRestricted = [
    { weapon: 'AUG', skin: 'Fleet Flock', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot6-iFAZu7OHNdQJO5du-gM7SlvP2a-KFxT9S7ZEliLnFpY6s21Ky8hBrYzz3JYSVcAY3Y13Q-VG2yebuhJG-78_NyyZnuCYgty6PyBCzhh1OaeU-0_OeVBzAUaTvHbY/256fx256f' },
    { weapon: 'SG 553', skin: 'Aerial', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopb3wflFf0Ob3YjoXuY-JhIGbk8j6PbDehWJT18l4jeHVu42migW3-RdoZ2n0I4SWeg8_YQ2C_FC2xri505K96YOJlyU87fBPmg/256fx256f' },
    { weapon: 'Tec-9', skin: 'Re-Entry', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoor-mcjhz3MzcdD4T08-lnYyOqPX3J6_ulGRD7cR9teHI9Kn9nBri-kZrYm3wdoSRdFI4Nw3V-Fe6k-rtjJa66J-fyCExsyImt3zVlxLkgx0eOOI_h6aYChHMUqRKQvRmw3G8Dg/256fx256f' },
  ];

  const chromaClassified = [
    { weapon: 'UMP-45', skin: 'Primal Saber', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo7e1f1Jf0Ob3ZDBSuImJhoGHlvP7PYTdn2xZ_Isl376VpYqmiwLh_BA9Yjr2d9LEdwJrZQnZ_QDrxr_pg5K-6cvPzCFguyZ2tHzcykThgE1IOeY41PaaCQLJgPXV098/256fx256f' },
    { weapon: 'PP-Bizon', skin: 'Judgement of Anubis', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLO_JAlf0Ob3dm5R092klorEwPSlNr_ummJW4NE_i7qQrNih0ALm-kVqNmrxLI6XJlBoMlCEqVO3k-bqgJ--v5qfyCQ37CsitC3ezkDjg09POrI90OfeFwtNGCb3OQ/256fx256f' },
    { weapon: 'G3SG1', skin: 'Stinger', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposem2LFZf1OD3dm5R642JqIGZqPv9NLPFqWdQ-sJ0xO2V9Nqm3wCw-UVuazv1cY6Se1c2YlrTqQC5xOa-0se7tM_PyHdqvXQnsHuPmUGy00wYcKUx0hzZZ0Bv/256fx256f' },
  ];

  const chromaCovert = [
    { weapon: 'M4A1-S', skin: 'Chantico\'s Fire', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alIITdn2xZ_Pp9i_vG8MLx2VS2qEdlNWD3cI-VIwE_N1jU81W3k7zogZ--u5vImyRjvyd07nmOmwv3308T5Zt0Dg/256fx256f' },
    { weapon: 'Five-SeveN', skin: 'Hyper Beast', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposLOzLhRlxfbGTj5X09q_goWYkuHxPYTck29Y_chOhujT8om7ilG1rkE4MjzwcNeSJAE2YQ3ZqwTqxOvm08W_vcvBn3pnvD5iuyj9PgdEAQ/256fx256f' },
  ];

  for (const item of chromaMilSpec) {
    const itemDef = await prisma.itemDefinition.create({
      data: {
        name: `${item.weapon} | ${item.skin}`,
        type: 'WEAPON' as ItemType,
        rarity: 'UNCOMMON' as Rarity,
        weapon: item.weapon,
        skin: item.skin,
        iconUrl: item.imageUrl,
        description: `Mil-Spec (Blue) from Chroma 3 case`,
        
        
      },
    });

    await prisma.caseDropItem.create({
      data: {
        caseId: chromaCase.id,
        itemDefId: itemDef.id,
        rarity: 'RARE',
        weight: 1.0,
      },
    });
  }

  for (const item of chromaRestricted) {
    const itemDef = await prisma.itemDefinition.create({
      data: {
        name: `${item.weapon} | ${item.skin}`,
        type: 'WEAPON' as ItemType,
        rarity: 'UNCOMMON' as Rarity,
        weapon: item.weapon,
        skin: item.skin,
        iconUrl: item.imageUrl,
        description: `Restricted (Purple) from Chroma 3 case`,
        
        
      },
    });

    await prisma.caseDropItem.create({
      data: {
        caseId: chromaCase.id,
        itemDefId: itemDef.id,
        rarity: 'RARE',
        weight: 1.0,
      },
    });
  }

  for (const item of chromaClassified) {
    const itemDef = await prisma.itemDefinition.create({
      data: {
        name: `${item.weapon} | ${item.skin}`,
        type: 'WEAPON' as ItemType,
        rarity: 'LEGENDARY' as Rarity,
        weapon: item.weapon,
        skin: item.skin,
        iconUrl: item.imageUrl,
        description: `Classified (Pink) from Chroma 3 case`,
        
        
      },
    });

    await prisma.caseDropItem.create({
      data: {
        caseId: chromaCase.id,
        itemDefId: itemDef.id,
        rarity: 'LEGENDARY',
        weight: 1.0,
      },
    });
  }

  for (const item of chromaCovert) {
    const itemDef = await prisma.itemDefinition.create({
      data: {
        name: `${item.weapon} | ${item.skin}`,
        type: 'WEAPON' as ItemType,
        rarity: 'LEGENDARY' as Rarity,
        weapon: item.weapon,
        skin: item.skin,
        iconUrl: item.imageUrl,
        description: `Covert (Red) from Chroma 3 case`,
        
        
      },
    });

    await prisma.caseDropItem.create({
      data: {
        caseId: chromaCase.id,
        itemDefId: itemDef.id,
        rarity: 'LEGENDARY',
        weight: 1.0,
      },
    });
  }

  // Add Chroma Knives
  console.log('  → Adding Chroma knives...');
  const chromaKnives = [
    { name: 'Karambit', skin: 'Doppler', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY60h-7gfeqJwW4IuJAn3LmZ8I-ijFbi-RVpMTzwd9CddwRqNw3Y_Qe5yOi51sS06J7IzHs1vSN27HyImkPmgxxKcKUx0onI4TDY/256fx256f' },
    { name: 'Bayonet', skin: 'Gamma Doppler', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJYAJR_OO7kZSDmfnLKr7u2mgIusQm3L-Sp4ih0FXi_hI5NWqhI4CWcgFvZVjWqVi9xOvvhpPvvJ2YwHVnuCEh5XjVn0Ow0U9IauE7h_KaVhzAT8HYSw0/256fx256f' },
  ];

  for (const knife of chromaKnives) {
    const itemDef = await prisma.itemDefinition.create({
      data: {
        name: `★ ${knife.name} | ${knife.skin}`,
        type: 'WEAPON' as ItemType,
        rarity: 'EXOTIC' as Rarity,
        weapon: knife.name,
        skin: knife.skin,
        iconUrl: knife.imageUrl,
        description: `★ Rare Special Item from Chroma 3 case`,
        
        
      },
    });

    await prisma.caseDropItem.create({
      data: {
        caseId: chromaCase.id,
        itemDefId: itemDef.id,
        rarity: 'EXOTIC',
        weight: 1.0,
      },
    });
  }

  console.log(`✅ Chroma 3 Case created with ${chromaMilSpec.length + chromaRestricted.length + chromaClassified.length + chromaCovert.length + chromaKnives.length} items\n`);

  console.log('📊 CS2 Drop Rates Applied:');
  console.log(`   🔵 Mil-Spec (RARE):      ${(CS2_DROP_RATES.RARE * 100).toFixed(2)}%`);
  console.log(`   🟣 Restricted (EPIC):    ${(CS2_DROP_RATES.RARE * 100).toFixed(2)}%`);
  console.log(`   🟣 Classified (LEGENDARY): ${(CS2_DROP_RATES.LEGENDARY * 100).toFixed(2)}%`);
  console.log(`   🔴 Covert (VERY_RARE):   ${(CS2_DROP_RATES.LEGENDARY * 100).toFixed(2)}%`);
  console.log(`   ⭐ Knives (EXOTIC):      ${(CS2_DROP_RATES.EXOTIC * 100).toFixed(2)}% ★ SUPER RARE!\n`);

  console.log('✨ Database seeded with real CS2 cases!');
}

seedCS2Cases()
  .catch((e) => {
    console.error('Error seeding CS2 cases:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
