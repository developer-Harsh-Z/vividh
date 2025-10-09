import Hero from "@/components/Hero/Hero";
import { motion } from "framer-motion";
import { Users, Calendar, Image, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "THE SQUAD",
      description: "Meet our talented team members",
      path: "/team",
    },
    {
      icon: Calendar,
      title: "MISSIONS",
      description: "Upcoming events and activities",
      path: "/events",
    },
    {
      icon: Image,
      title: "ARCHIVE",
      description: "Gallery of our memorable moments",
      path: "/gallery",
    },
    {
      icon: Zap,
      title: "JOIN US",
      description: "Become part of the community",
      path: "/join",
    },
  ];

  return (
    <div className="bg-black">
      <Hero />

      {/* Quick Links Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-black"
          >
            EXPLORE VIVIDH
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(feature.path)}
                  className="bg-white border-2 border-black p-8 cursor-pointer group hover:bg-black hover:border-[hsl(var(--electric-blue))] transition-all duration-300"
                >
                  <Icon className="w-12 h-12 mb-4 group-hover:text-[hsl(var(--electric-blue))] transition-colors" />
                  <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 group-hover:text-gray-300 transition-colors">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-black text-white">
        <div className="container mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Ready to Join the Movement?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-xl mb-8"
          >
            Be part of something extraordinary
          </motion.p>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            onClick={() => navigate("/join")}
            className="bg-white text-black px-8 py-4 font-bold hover:bg-[hsl(var(--electric-blue))] transition-colors duration-300"
          >
            GET STARTED
          </motion.button>
        </div>
      </section>
    </div>
  );
};

export default Home;
