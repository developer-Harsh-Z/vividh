import { motion } from "framer-motion";
import { useState } from "react";

const Gallery = () => {
  const [filter, setFilter] = useState("all");

  const categories = ["all", "events", "workshops", "team", "awards"];

  const images = [
    { id: 1, category: "events", title: "Annual Tech Fest 2023" },
    { id: 2, category: "workshops", title: "Content Creation Workshop" },
    { id: 3, category: "team", title: "Team Building Activity" },
    { id: 4, category: "awards", title: "Best Club Award" },
    { id: 5, category: "events", title: "Social Media Summit" },
    { id: 6, category: "workshops", title: "Photography Masterclass" },
    { id: 7, category: "team", title: "Squad Photoshoot" },
    { id: 8, category: "events", title: "Campus Festival" },
    { id: 9, category: "awards", title: "Innovation Award" },
    { id: 10, category: "workshops", title: "Video Editing Bootcamp" },
    { id: 11, category: "team", title: "Leadership Summit" },
    { id: 12, category: "events", title: "Alumni Meetup" },
  ];

  const filteredImages = filter === "all" 
    ? images 
    : images.filter(img => img.category === filter);

  return (
    <div className="min-h-screen bg-black pt-16">
      {/* Hero Section */}
      <section className="py-20 px-4 text-white">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            MEMORY ARCHIVE
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400"
          >
            Capturing moments that define our journey
          </motion.p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="px-4 pb-12">
        <div className="container mx-auto flex flex-wrap justify-center gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-6 py-2 font-bold uppercase transition-all ${
                filter === category
                  ? "bg-white text-black"
                  : "bg-transparent text-white border border-white hover:bg-white hover:text-black"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="px-4 pb-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                {/* Polaroid Frame */}
                <div className="bg-white p-4 pb-16 lift-up">
                  <div className="aspect-square bg-gray-300 relative overflow-hidden">
                    {/* Placeholder with pattern */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-400">
                      <div className="text-6xl font-bold text-gray-500/20">
                        {image.id}
                      </div>
                    </div>
                  </div>
                  {/* Photo Caption */}
                  <div className="mt-4 text-center">
                    <p className="text-black font-handwriting text-lg">
                      {image.title}
                    </p>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-[hsl(var(--electric-blue))]/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-black text-white px-6 py-3 font-bold hover:bg-white hover:text-black transition-colors">
                    VIEW FULL SIZE
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
