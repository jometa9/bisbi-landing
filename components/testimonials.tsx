"use client";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Carlos R.",
    role: "Prop Firm Trader | 2+ years",
    content:
      "Setup took me like 10 minutes—connect MT4/5, connect the accounts between each other and you're good. I use it to send signals to my challenge accounts. UI is simple, you don't get lost. Latency on my machine feels low.",
  },
  {
    id: 2,
    name: "Ana S.",
    role: "Trader | Funded accounts",
    content:
      "Runs on my PC, no VPS. I copy from my master to two prop firm accounts. Tried something else first and had issues; with this I've been running a few weeks and it's stable. Interface isn't fancy but it gets to the point.",
  },
  {
    id: 3,
    name: "Thomas B.",
    role: "Retail Trader | 4+ years experience",
    content:
      "I use it to replicate trades to my challenges. Setup was straightforward and execution feels fast. Not perfect—I'd like more filter options sometimes—but for what it does it works. Clear UX.",
  },
];

export function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-3">
      <p className="text-xl text-gray-600 mb-1">Testimonials</p>
      <p className="md:text-3xl text-2xl mb-6 text-gray-900">
        Traders running IPTRADE today
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mx-auto">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="relative overflow-hidden rounded-lg p-6 bg-gray-100 pb-6 pt-18"
          >
            <h6 className="text-lg  text-gray-900">{testimonial.name}</h6>
            <p className="text-sm text-gray-600">{testimonial.role}</p>
            <p className="text-gray-700 text-sm leading-relaxed mt-4">"
              {testimonial.content}"
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
