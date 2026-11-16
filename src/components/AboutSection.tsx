import { Compass, CalendarCheck, HeartHandshake } from "lucide-react";

export default function AboutSection() {
  const features = [
    {
      icon: Compass,
      title: "Discover Opportunities",
      description: "Find workshops, hackathons, and events in one place.",
      detail:
        "Explore a curated catalog of hands-on learning, tech meetups, creative bootcamps, and networking sessions tailored to your interests.",
    },
    {
      icon: CalendarCheck,
      title: "Stay Organized",
      description: "Save events, manage registrations, and track deadlines.",
      detail:
        "Keep all your workshop confirmations, schedules, and milestone reminders neatly organized in a single unified personal hub.",
    },
    {
      icon: HeartHandshake,
      title: "Grow Together",
      description: "Share opportunities and connect with your community.",
      detail:
        "Share discovered opportunities with peers, build connections with fellow participants, and collaborate with passionate organizers.",
    },
  ];

  return (
    <section
      id="about"
      className="py-20 sm:py-28 bg-[#FAF8FE] border-t border-purple-100/60 scroll-mt-18"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-[#7543DF] bg-[#F4F0FF] border border-purple-100 mb-4">
            About The Platform
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#242136] tracking-tight">
            One Community.{" "}
            <span className="text-[#7543DF]">Endless Opportunities.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#64607D] leading-relaxed">
            Community Skills Hub is designed to bridge the gap between passionate
            learners and inspiring organizers. Everything you need to discover,
            participate, and elevate your skills in one central home.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 border border-purple-100/80 shadow-sm hover:shadow-xl hover:shadow-purple-950/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-[#F4F0FF] text-[#7543DF] flex items-center justify-center group-hover:bg-[#7543DF] group-hover:text-white transition-all duration-300 mb-6 shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-[#242136] group-hover:text-[#7543DF] transition-colors duration-200">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm sm:text-base font-medium text-[#7543DF]">
                    {item.description}
                  </p>
                  <p className="mt-3 text-sm text-[#64607D] leading-relaxed">
                    {item.detail}
                  </p>
                </div>

                {/* Subtle Bottom Accent Indicator */}
                <div className="mt-6 pt-4 border-t border-purple-50 flex items-center text-xs font-semibold text-[#7543DF] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span>Learn more</span>
                  <span className="ml-1 transition-transform group-hover:translate-x-1 duration-200">
                    →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
