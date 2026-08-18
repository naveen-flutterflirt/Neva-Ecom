const socialPosts = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    image:
      'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    image:
      'https://images.unsplash.com/photo-1563784462386-044fd95e9852?auto=format&fit=crop&w=900&q=80',
  },
];

export default function SocialProofStrip() {
  return (
    <section className="relative overflow-hidden py-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left,_rgba(168,85,247,0.08),transparent_30%),radial-gradient(circle_at_right,_rgba(34,211,238,0.08),transparent_30%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-zinc-200/80 bg-white/30 p-4 backdrop-blur-md shadow-[0_0_30px_rgba(109,40,217,0.08)] dark:border-zinc-800/80 dark:bg-zinc-900/30 sm:p-6">
          <div className="mb-5 flex flex-col gap-2 border-b border-zinc-300/80 pb-3 dark:border-zinc-700/80 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
                Instagram / Social Proof
              </p>
              <h3 className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">Loved by our community</h3>
            </div>

            <span className="inline-flex w-fit items-center rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300">
              @nevashop.in
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {socialPosts.map((post) => (
              <div
                key={post.id}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(168,85,247,0.08)] dark:border-zinc-700 dark:bg-zinc-950/70"
              >
                <img
                  src={post.image}
                  alt={`Social proof post ${post.id}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-zinc-900/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-3 flex justify-center">
                  {/* <span className="rounded-full border border-zinc-300 bg-white/80 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300">
                    Upload Post
                  </span> */}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-2 border-t border-zinc-300/80 pt-3 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600 dark:border-zinc-700/80 dark:text-zinc-300 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span>NevaShop.in</span>
              <span className="text-zinc-400">|</span>
              <span className="text-zinc-500 dark:text-zinc-400">@nevashop.in</span>
            </div>

            <div className="flex flex-wrap gap-3 text-zinc-500 dark:text-zinc-400">
              <span>Shipping</span>
              <span>Returns</span>
              <span>Privacy</span>
              <span>Terms</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
