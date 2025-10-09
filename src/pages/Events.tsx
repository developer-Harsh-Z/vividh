import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const Events = () => {
  const events = [
    {
      title: "Social Media Marketing Workshop",
      date: "March 15, 2024",
      time: "2:00 PM - 5:00 PM",
      location: "Main Auditorium",
      description: "Learn the latest strategies in social media marketing from industry experts",
      status: "upcoming",
      registrations: 75,
      capacity: 100,
      featured: true,
    },
    {
      title: "Content Creation Bootcamp",
      date: "March 22, 2024",
      time: "10:00 AM - 4:00 PM",
      location: "Digital Media Lab",
      description: "Hands-on training in video editing, photography, and content strategy",
      status: "upcoming",
      registrations: 45,
      capacity: 60,
      featured: false,
    },
    {
      title: "Annual Tech Fest",
      date: "April 5, 2024",
      time: "9:00 AM - 6:00 PM",
      location: "Campus Grounds",
      description: "VIVIDH's biggest event featuring competitions, exhibitions, and guest speakers",
      status: "upcoming",
      registrations: 150,
      capacity: 200,
      featured: true,
    },
    {
      title: "Alumni Meetup",
      date: "February 28, 2024",
      time: "6:00 PM - 9:00 PM",
      location: "Conference Hall",
      description: "Network with successful alumni working in top media companies",
      status: "past",
      registrations: 60,
      capacity: 60,
      featured: false,
    },
  ];

  const upcomingEvents = events.filter(e => e.status === "upcoming");
  const pastEvents = events.filter(e => e.status === "past");

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
            MISSIONS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400"
          >
            Join us in our upcoming events and activities
          </motion.p>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">UPCOMING EVENTS</h2>
          <div className="space-y-8 max-w-4xl mx-auto">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`bg-black text-white p-8 border-4 ${
                  event.featured 
                    ? "border-[hsl(var(--gold))]" 
                    : "border-black"
                }`}
              >
                {event.featured && (
                  <span className="inline-block bg-[hsl(var(--gold))] text-black px-4 py-1 text-sm font-bold mb-4">
                    FEATURED
                  </span>
                )}
                <h3 className="text-3xl font-bold mb-4">{event.title}</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-6 text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={20} />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={20} />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={20} />
                    <span>{event.location}</span>
                  </div>
                </div>
                <p className="text-gray-300 mb-6">{event.description}</p>
                
                {/* Registration Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Registrations</span>
                    <span>{event.registrations}/{event.capacity}</span>
                  </div>
                  <Progress 
                    value={(event.registrations / event.capacity) * 100} 
                    className="h-2 bg-gray-800"
                  />
                </div>

                <Button className="bg-[hsl(var(--electric-blue))] text-black hover:bg-[hsl(var(--electric-blue))]/90 font-bold">
                  REGISTER NOW
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Events */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">PAST EVENTS</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pastEvents.map((event, index) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border-2 border-black p-6 opacity-75 hover:opacity-100 transition-opacity"
              >
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-4">{event.date}</p>
                <p className="text-sm">{event.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;
