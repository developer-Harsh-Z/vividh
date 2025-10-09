import { motion } from "framer-motion";
import { TrendingUp, Users, Award, Target } from "lucide-react";

const About = () => {
  const timeline = [
    {
      year: "2020",
      title: "FOUNDATION",
      description: "VIVIDH was established to bring together creative minds in social media",
    },
    {
      year: "2021",
      title: "GROWTH",
      description: "Expanded to 50+ active members with diverse skill sets",
    },
    {
      year: "2022",
      title: "ACHIEVEMENT",
      description: "Won multiple inter-college competitions and launched major campaigns",
    },
    {
      year: "2023",
      title: "INNOVATION",
      description: "Pioneered new content formats and digital storytelling techniques",
    },
  ];

  const stats = [
    { icon: Users, value: "100+", label: "MEMBERS" },
    { icon: Award, value: "25+", label: "AWARDS" },
    { icon: Target, value: "50+", label: "PROJECTS" },
    { icon: TrendingUp, value: "1M+", label: "REACH" },
  ];

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-black text-white">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            OUR STORY
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-3xl mx-auto"
          >
            A journey of creativity, innovation, and community building through social media
          </motion.p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {timeline.map((item, index) => (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative pl-8 pb-12 border-l-4 border-black manga-panel"
            >
              <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-[hsl(var(--electric-blue))] border-4 border-white" />
              <div className="bg-white border-2 border-black p-6">
                <span className="text-[hsl(var(--electric-blue))] font-bold text-sm">
                  {item.year}
                </span>
                <h3 className="text-2xl font-bold mt-2 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-black">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <Icon className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--electric-blue))]" />
                  <div className="text-4xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-8"
          >
            OUR MISSION
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 leading-relaxed"
          >
            To empower students with the skills and knowledge to excel in the digital age,
            creating impactful content that resonates with audiences and drives positive change
            in our community and beyond.
          </motion.p>
        </div>
      </section>
    </div>
  );
};

export default About;
