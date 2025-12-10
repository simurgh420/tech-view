// prisma/seed.ts
import prisma from '@/services/db/client';
import { toSlug } from '@/lib/slug';

async function main() {
  await prisma.blogPost.create({
    data: {
      title: '5 Things You Probably Didn’t Know About Headphones',
      slug: toSlug('5 Things You Probably Didn’t Know About Headphones'),
      excerpt:
        'Discover five surprising facts about headphone technology, from bone conduction to virtual surround.',
      content: `
1. **Stereo Sound Perception**  
Binaural perception uses time differences in sound arrival to simulate 3D audio.

2. **Noise-Canceling Magic**  
Noise-canceling headphones emit anti-noise signals to suppress background sounds.

3. **Bone Conduction Technology**  
These headphones transmit sound through cheekbones, allowing ambient awareness.

4. **Virtual Surround Sound**  
High-end models simulate multi-speaker setups using advanced algorithms.

5. **Wired vs. Wireless**  
Wired headphones often deliver better audio due to reduced compression and latency.
      `,
      coverImageUrl: '/img/blogs/headphones.png',
      readingMinutes: 4,
      publishedAt: new Date('2023-03-28'),
      author: 'George Laren',
      status: 'PUBLISHED',
    },
  });

  console.log('✅ Blog post seeded');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
