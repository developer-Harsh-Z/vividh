import { motion } from "framer-motion";
import { useState } from "react";
import { Github, Linkedin, Twitter } from "lucide-react";

const Team = () => {
  const [filter, setFilter] = useState("all");

  const roles = ["all", "leadership", "creative", "technical", "marketing"];

  const teamMembers = [
    {
      name: "Alex Chen",
      role: "President",
      category: "leadership",
      skills: ["Strategy", "Leadership", "Public Speaking"],
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    },
    {
      name: "Sarah Williams",
      role: "Creative Director",
      category: "creative",
      skills: ["Design", "Branding", "Video Editing"],
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    {
      name: "Mike Johnson",
      role: "Tech Lead",
      category: "technical",
      skills: ["Web Dev", "Analytics", "Automation"],
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    },
    {
      name: "Emily Davis",
      role: "Marketing Head",
      category: "marketing",
      skills: ["SEO", "Content", "Social Media"],
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    },
    {
      name: "David Lee",
      role: "VP Operations",
      category: "leadership",
      skills: ["Management", "Planning", "Coordination"],
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    },
    {
      name: "Lisa Anderson",
      role: "Content Creator",
      category: "creative",
      skills: ["Writing", "Photography", "Storytelling"],
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    },
  ];

  const filteredMembers = filter === "all" 
    ? teamMembers 
    : teamMembers.filter(member => member.category === filter);

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
            THE SQUAD
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400"
          >
            Meet the talented individuals driving VIVIDH forward
          </motion.p>
        </div>
      </section>

      {/* Filter Buttons */}
      <section className="px-4 pb-12">
        <div className="container mx-auto flex flex-wrap justify-center gap-4">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-6 py-2 font-bold uppercase transition-all ${
                filter === role
                  ? "bg-[hsl(var(--electric-blue))] text-black"
                  : "bg-white text-black hover:bg-gray-200"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </section>

      {/* Team Grid */}
      <section className="px-4 pb-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border-4 border-white group hover:border-[hsl(var(--electric-blue))] transition-all duration-300 lift-up"
              >
                <div className="aspect-square bg-gray-200 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                  <p className="text-gray-600 mb-4">{member.role}</p>
                  
                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {member.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-black text-white text-xs font-bold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href="#" className="text-black hover:text-[hsl(var(--electric-blue))] transition-colors">
                      <Linkedin size={20} />
                    </a>
                    <a href="#" className="text-black hover:text-[hsl(var(--electric-blue))] transition-colors">
                      <Twitter size={20} />
                    </a>
                    <a href="#" className="text-black hover:text-[hsl(var(--electric-blue))] transition-colors">
                      <Github size={20} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Team;
