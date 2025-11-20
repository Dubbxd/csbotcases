import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  try {
    // ============================================
    // 1. SEED KEY DEFINITION
    // ============================================
    console.log('📦 Seeding Key Definition...');
    
    const key = await prisma.keyDefinition.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Universal Key',
        description: 'A universal key that can open any CS2 case',
        imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KhfDLPr7Vn35cppEs0rrD99Sl2ALh-0dkMGv7JoTBcgI_ZV3R-wfqw7_o0cC9vp2dmyBh73Nw7SrbmhW1gR5SZLQ6hqaYCwOU0h4EBw',
        coinPrice: 0,
        isDefault: true,
      },
    });
    console.log(`✅ Key created: ${key.name}\n`);

    // ============================================
    // 2. SEED DREAMS & NIGHTMARES CASE
    // ============================================
    console.log('📦 Seeding Dreams & Nightmares Case...');
    
    const dreamsCase = await prisma.caseDefinition.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Dreams & Nightmares Case',
        description: 'This case contains one of the following:',
        imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alDL7Ol2Vu5Mx2gv2P8I2tigGy-hFvYWumIY6Uc1M-aV2D-wPryOzxxcjvqhsojzs',
        coinPrice: 0,
        keyRequired: true,
        availableInShop: true,
        series: 'Dreams & Nightmares',
      },
    });
    console.log(`✅ Case created: ${dreamsCase.name}`);

    const dreamsItems = [
      // Mil-Spec (Blue) - 79.92%
      { name: 'MP9 | Starlight Protector', rarity: 'UNCOMMON', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6r8FA957ODYfi9W9eO6nYeDg7mmZbqIlDMEsZEi2L3CrdnziVLh-UNvZGj0JoeRdFRvMl6G_gC8k7vphcW1usvOmHcxvSEh4SvZgVXp1qs7G6DF' },
      { name: 'G3SG1 | Dream Glade', rarity: 'UNCOMMON', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposem2LFZf1OD3dm5R642JgIKbmvj2Pb7VhFRc7cF4n-SP9N2jjwfnqUNuYWvwJoWVIwZoZw3S-FC8xru50J615ZjInmwj5HeGXW7jfw' },
      { name: 'XM1014 | Zombie Offensive', rarity: 'UNCOMMON', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgporrf0e1Y07PDdTi5H7c-JhJKCmfzLPr7Vn35cppYl3b2Qpt2h3gLg-ERlYmD0cIKTdVA9MFDUr1i2wOy9hZPq6pnLznE1pGB8sm7XlAQ' },
      { name: 'PP-Bizon | Space Cat', rarity: 'UNCOMMON', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLO_JAlf0v73dShD4N6zhoWfg_bnDLfYkWNFppV1j-rT-I3wt1i1uRQ5Yzz7coGXe1JtNwqE-QC3k-7u08K5vM_NwHFn7yMk4yzYmhHhiRBPb7JpgvCcDFOdWvc' },
      { name: 'MAG-7 | Insomnia', rarity: 'UNCOMMON', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou7uifDhzw8zfeDdR7eCmhoyKhfzLPr7Vn35cppMl3bqY8d2h3way8kBrYm7yLNWRdAU7MFHS_lDqyb_n1sK96JnAyiMxs3Uo5WKPl08h1Uge' },
      { name: 'Dual Berettas | Melondrama', rarity: 'UNCOMMON', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpos7asPwJf0Ob3dShD4N6zhoWfg_bnDLbUhH9u6cMmi_rVyoD8j1yg5Uo4ZmCmI4OVcFBvYFuCrwC5lebvjJ-5vZrPmidhunQhtirfnUS20h9Pb7Y4gPaYQlbdPt32XA' },
      { name: 'P250 | Re.built', rarity: 'UNCOMMON', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopujwezhoyszffi9H_9qkhIWFg8j4OrzZgiVQ7sROn-zTprT0t1i5lB89IT6mOoaVJgc5YFqErwK4xem-1pW96J6b1zI97bTrDNLo' },

      // Restricted (Purple) - 15.98%
      { name: 'FAMAS | Rapid Eye Movement', rarity: 'RARE', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposLuoKhRf1OD3dzxP7c-JmYWPnuL5fYTck29Y_chOhujT8om7jVeyrUBvamjzd4-ddFU2Z1HSqVe6k7y50Ji9tZqfzyAwvyUr-z-DyNJSXfNB' },
      { name: 'SSG 08 | Dezastre', rarity: 'RARE', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopamie19f0Ob3Yi5FvISJnJm0mOLnMrXVqW1Q7MBOhuDG_ZjKhFWmrBFyam-gLNfBcFU4ZFzQ_we_wOe7hJW56ZXIznNlvCQgtCmLgVXp1W4-xJWp' },
      { name: 'MP5-SD | Necro Jr.', rarity: 'RARE', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6rwOANf1OD3eShM-Nmkq4GHnvT6J4Tdn2xZ_Itw0urA9IjKhFG1uRQ9fTzzdtLBcABrYl_TrlW8w-nqh5XoucydnXJn7HMr5mGdwUKuMF1LLA' },
      { name: 'USP-S | Ticket to Hell', rarity: 'RARE', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ09-jq5WYh8j_OrfdqWhe5sN0teXI8oThxgKwqRJvN22gIoTGdQU3Ml-DrVO5wO3vhZ_vuZTO1zI97dKJKtNO' },
      { name: 'MP7 | Abyssal Apparition', rarity: 'RARE', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6ryFABz7P7YKAJA4867mIyCkP_xMq3I2D8FuZJy0-qVp9mkjFXj_UJuMjvwcY-VewM4aAnR_Ve_lOfxxcjvl6q2lHU' },

      // Classified (Pink) - 3.20%
      { name: 'AK-47 | Nightwish', rarity: 'VERY_RARE', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV08-jhYSEg8j4OrzZgiUD7JYk07qSoI2jigLmqEc5MWr1dY6QdVA-Z1vYqFfqx7_ohZfoucidnXJn7HN6JBSk' },
      { name: 'M4A4 | Temukau', rarity: 'VERY_RARE', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alDL7clm5u5Mx2gv2P9typ2AC2_0RrNm_7ddeTdgRqZgnU_lK-yOe615S9v8zOmHNi7j5iuyiMVyPqUA' },
      { name: 'MP9 | Manitou', rarity: 'VERY_RARE', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6r8FAZu7P7YKAJA4867mIyCkP_xMq3I2D9QuZAo3rjF9NWk2wLh_xZoYGz2I46dcgVoYlrS-Fi4wL--gJ697p_NyyMw7iIqt3ncl0TkgExLarQx0v_KRFGe' },

      // Covert (Red) - 0.64%
      { name: 'AWP | Duality', rarity: 'LEGENDARY', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwOq7c2GpTsZIgiL-U84n03lLl_EM9Zzr6IYWcdwE5YQyBqAPvxbjqh5S6vcvNnCNquCM8pSGKOG6i9nQ' },
      { name: 'Dual Berettas | Hideout', rarity: 'LEGENDARY', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpos7asPwJfwPzYfgJR_-Ozmoa0mvLwOq7c2DwEu5Rz2uqQod6h2wO1qhE9Zjv1ItfGJw85Z1yC-VS6wrvp1pDptZ6dy3Jnv3UqpGB8mrc9hZc' },

      // Exceedingly Rare (Knife) - 0.26%
      { name: '★ Stiletto Knife', rarity: 'EXOTIC', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfw-bbeQJD7eOwlYSOqPv9NLPF2G1UD8F08IiXo-XwjFCLqBo9Nir7II_Ecwc_N1DW_gTskLy618K9vpmfyydhsyR25SveyRGpwUYbQuoq7w' },
      { name: '★ Paracord Knife', rarity: 'EXOTIC', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfw-bbeQJD7eOwlYSOqPv9NLPFqWdQ-sJ0xL6UrI7w0Afh-RI4Zj-iJo-WJ1BrN1mC-VS_x-jshJC7upTIyCBr6HMgs3jbzhWy1UxJbLM80PeSRFGe8ePTL_E' },
      { name: '★ Survival Knife', rarity: 'EXOTIC', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfw-bbeQJD7eOwlYSOqPv9NLPF2G8D7Ml137yR94n02Ae38xBsam2nctfAdgI_YgzT_lfow-3p0J-u78nJnSdmvHQqsSqMmhLkgUoYOeZrhvOfQV7JU_seCbS2' },
    ];

    for (const item of dreamsItems) {
      const itemDef = await prisma.itemDefinition.upsert({
        where: { name: item.name },
        update: {},
        create: {
          name: item.name,
          description: `${item.name} from Dreams & Nightmares Case`,
          rarity: item.rarity,
          type: 'WEAPON',
          imageUrl: item.imageUrl,
        },
      });

      await prisma.caseDropItem.upsert({
        where: {
          caseId_itemId: {
            caseId: 1,
            itemId: itemDef.id,
          },
        },
        update: {},
        create: {
          caseId: 1,
          itemId: itemDef.id,
          rarity: item.rarity,
        },
      });
    }
    console.log(`✅ Added ${dreamsItems.length} items to Dreams & Nightmares Case\n`);

    // ============================================
    // 3. SEED CHROMA 3 CASE
    // ============================================
    console.log('📦 Seeding Chroma 3 Case...');
    
    const chroma3Case = await prisma.caseDefinition.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        name: 'Chroma 3 Case',
        description: 'This case contains one of the following:',
        imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uOxh7-Gw_alDLjQhH9e5sR0teXI8oThxlfi_Es5ZWv7cI6VcFI4N17Y_FTsxOy-gZXu6snBz3th6SIr5H7YnhfhhBsebbdpgvKcVl3IWfQNTfPzHmo',
        coinPrice: 0,
        keyRequired: true,
        availableInShop: true,
        series: 'Chroma 3',
      },
    });
    console.log(`✅ Case created: ${chroma3Case.name}`);

    const chroma3Items = [
      // Mil-Spec (Blue) - 79.92%
      { name: 'CZ75-Auto | Red Astor', rarity: 'UNCOMMON', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotaDyfgZf1OD3cicVueOihoWKk8j4OrzZgiVXuZYiiLzFoYmg2lKyqktrMGz7IY-Xdg84Z1GE-1i5lLvvgJK16oOJlyWEt5mxOg' },
      { name: 'Sawed-Off | Fubar', rarity: 'UNCOMMON', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopbuyLgNv1fX3eSR9-t2kk4WfqPH9NrbDk1Rd4cJ5nqeTot-g0ALjqUdoZ2vzINSScgQ4YVrR_gXol-ztjZe0ot2XnraXKPOh' },
      { name: 'P2000 | Oceanic', rarity: 'UNCOMMON', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovrG1eVcwg8zPYgJSvozmxL-CmufxIbLQmlRd4cJ5nqeQrYmk3VCx_0c-Yjv3cdKQIQ82ZQ3W_Vm_xezohZC56ZrKnSA1syUgsXiJgVXp1Rc2vvfX' },
      { name: 'Galil AR | Orange DDPAT', rarity: 'UNCOMMON', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbupIgthwczPYgJAvozmxL-DjsjwN67cqWdQ-sJ0xLHEo9qliwLk-kdlZ2_3JoWRcAY8ZlDYqQS-kLi715S-75rLyHs37XYn4XyIgVXp1SFvXZwA' },
      { name: 'M249 | Blizzard Marbleized', rarity: 'UNCOMMON', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-jxcjhzw8zFdC5K092kl4WYqPv1Ib7ummJW4NE_2r3DodvzjgHgqBY-ZzryIIbBIwRqMFHS_we2l-68h5Xu6JzNmydl6yYr-z-DyCMdJHlG' },
      { name: 'Dual Berettas | Ventilators', rarity: 'UNCOMMON', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpos7asPwJf1OD3YS197tWsm460n_bmJb7Cgm5D18d0j-3I4IG72lCx-xFuYz3wcoCLMlhHZxiOrVw-TO' },
      { name: 'MP9 | Bioleak', rarity: 'UNCOMMON', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6r8FAZt7P7YKAJA4867mIyCkP_xMq3I2G8AvcRz0-qV9I-m0VXk_UBrYm6gI4OccFI9M1vX8li5le7o08C_756fyyBjsyMm5nbD30vgMTlzXkU' },

      // Restricted (Purple) - 15.98%
      { name: 'UMP-45 | Primal Saber', rarity: 'RARE', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo7e1f1Jf0uL3ZzxQ5d-3mY-0m_7zO6_ummpD78A_3rqRrI3w3w3s-BE9Nj_3IICdc1Q7Zg3S_lLsw-rpjZbvtZzIn3swvikr7S3D30vgFYZV04I' },
      { name: 'SSG 08 | Ghost Crusader', rarity: 'RARE', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopamie19f0Ob3Yi5FvISJnJm0mOLnMrXVqW1u5Mx2gv2P84ih2AO1-kU-Nmmhd4KScAdrYw6D8gK5yOfpjJXutJmdnyY17yly4WGdwUL0XJbnHA' },
      { name: 'P250 | Asiimov', rarity: 'RARE', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopujwezhjxszYI2gS09-5lpKKqPrxN7LEmyVQ7MEpiLuSrYmiigLs_EprYmGlcNeTdVJrZlvVrwPrwObxxcjv2ktIixM' },
      { name: 'SCAR-20 | Bloodsport', rarity: 'RARE', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopbmkOVUw7PvRTi5B7c7kxL-BgvLLP7LWnn8fscEh3r2X99Sj3wLnqkdsYmqmJ9DBIwJsZA7R-QC8l-rshJ--vZ-ay3FluyEm4SrUmh2_n1gSOcLQJdTh' },
      { name: 'Tec-9 | Re-Entry', rarity: 'RARE', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoor-mcjhzw8zcdD4b08-jhIWZlP_1IbzVhFRd4cJ5nqeQpI-l2QO3_ko9NjigI9SVcgA2YAnXrle-wufsh5S5tZrMmHM16SJ35H2JgVXp1RjqNPJN' },

      // Classified (Pink) - 3.20%
      { name: 'PP-Bizon | Judgement of Anubis', rarity: 'VERY_RARE', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLO_JAlf0Ob3dShD4N6zhoWfg_bnDLfYkWNFpsR12eqQ99Sn3QC3_EBqamqmJoWXJw84Yw3X_Vm_xOa9g8O6uZvPm3UwsnEncWGdwUIaFVh1Vw' },
      { name: 'G3SG1 | Stinger', rarity: 'VERY_RARE', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposem2LFZf0Ob3dShD4N6zhoWfg_bnDLfYkWNFppNz2r6Wod_zjAznqEVkN22iLISQdlI9Z1nW_FK3x7jqhZbtvM7OziNhuCRw4XiPnQv330_VC7kxQQ' },
      { name: 'M4A1-S | Chantico's Fire', rarity: 'VERY_RARE', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uOxh7-Gw_alDLPIhm5D18d0j-3I4IG7igex_UFsYmqhIY_Adwc2NQnZ_1e2le68gJ617Z7AzHdluT5iuyh0aOucEA' },

      // Covert (Red) - 0.64%
      { name: 'AK-47 | Phantom Disruptor', rarity: 'LEGENDARY', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV086jloKOqPrxN7LEmyVQ7MEpiLuU99Xx2w3m-RJqZWGhI4SQIFRqMw7U_FTow-vxxcjvUiWEfaI' },
      { name: 'XM1014 | Black Tie', rarity: 'LEGENDARY', imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgporrf0e1Y07PLFTi5H7c-JhJKCmfzLPr7Vn35c18lwmO7Eu9r33le2-UdlN2ihIISVdlBvYV6C_le6l-br1J_qucnNnyFr6CN05GGdwUKg6LZlhA' },
    ];

    for (const item of chroma3Items) {
      const itemDef = await prisma.itemDefinition.upsert({
        where: { name: item.name },
        update: {},
        create: {
          name: item.name,
          description: `${item.name} from Chroma 3 Case`,
          rarity: item.rarity,
          type: 'WEAPON',
          imageUrl: item.imageUrl,
        },
      });

      await prisma.caseDropItem.upsert({
        where: {
          caseId_itemId: {
            caseId: 2,
            itemId: itemDef.id,
          },
        },
        update: {},
        create: {
          caseId: 2,
          itemId: itemDef.id,
          rarity: item.rarity,
        },
      });
    }
    console.log(`✅ Added ${chroma3Items.length} items to Chroma 3 Case\n`);

    // ============================================
    // 4. UPDATE SHOP ITEMS
    // ============================================
    console.log('🏪 Updating shop items...');

    await prisma.shopItem.deleteMany({});

    const cases = await prisma.caseDefinition.findMany({
      where: { availableInShop: true },
    });

    const keys = await prisma.keyDefinition.findMany({});

    for (const caseItem of cases) {
      await prisma.shopItem.create({
        data: {
          itemType: 'CASE',
          caseId: caseItem.id,
          price: caseItem.coinPrice,
          available: true,
        },
      });
      console.log(`  ✅ Added to shop: ${caseItem.name}`);
    }

    for (const key of keys) {
      await prisma.shopItem.create({
        data: {
          itemType: 'KEY',
          keyId: key.id,
          price: key.coinPrice,
          available: true,
        },
      });
      console.log(`  ✅ Added to shop: ${key.name}`);
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - 1 Key Definition`);
    console.log(`   - 2 Cases (Dreams & Nightmares, Chroma 3)`);
    console.log(`   - ${dreamsItems.length + chroma3Items.length} Total Items`);
    console.log(`   - ${cases.length + keys.length} Shop Items`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
