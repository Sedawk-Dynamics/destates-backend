import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data
  await prisma.cartItem.deleteMany();
  await prisma.contactInquiry.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.property.deleteMany();
  await prisma.landPlot.deleteMany();
  await prisma.pGListing.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleared existing data.");

  // Seed Properties
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        name: "Skyline Heights",
        location: "Electronic City, Phase 2",
        city: "Bangalore",
        price: 50000000,
        expectedROI: 12,
        monthlyYield: 1.0,
        area: 2500,
        units: 50,
        availableUnits: 35,
        status: "AVAILABLE",
        description:
          "Skyline Heights is a premium residential project located in the heart of Electronic City, Bangalore. This RERA-registered property offers modern amenities, excellent connectivity to IT hubs, and a promising investment opportunity with verified returns. The project features spacious apartments with contemporary design, landscaped gardens, a swimming pool, gymnasium, and 24/7 security.",
        highlights: [
          "RERA Registered",
          "Ready to Move",
          "24/7 Security",
          "Swimming Pool",
          "Gymnasium",
          "Landscaped Gardens",
          "Close to IT Hub",
          "Metro Connectivity",
        ],
        images: [
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
        ],
        reraRegistered: true,
        readyToMove: true,
        type: "Residential",
      },
    }),
    prisma.property.create({
      data: {
        name: "Emerald Gardens",
        location: "Whitefield Main Road",
        city: "Bangalore",
        price: 75000000,
        expectedROI: 14,
        monthlyYield: 1.2,
        area: 3500,
        units: 30,
        availableUnits: 18,
        status: "AVAILABLE",
        description:
          "Emerald Gardens is an ultra-luxury residential enclave in Whitefield, one of Bangalore's most sought-after localities. With premium finishes, world-class amenities, and proximity to major tech parks, this property offers exceptional value for discerning investors seeking high returns and capital appreciation.",
        highlights: [
          "RERA Registered",
          "Ready to Move",
          "Club House",
          "Tennis Court",
          "Jogging Track",
          "Children's Play Area",
          "Near Tech Parks",
          "Premium Finishes",
        ],
        images: [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
        ],
        reraRegistered: true,
        readyToMove: true,
        type: "Residential",
      },
    }),
    prisma.property.create({
      data: {
        name: "Urban Pearl",
        location: "100 Feet Road, Indiranagar",
        city: "Bangalore",
        price: 45000000,
        expectedROI: 11,
        monthlyYield: 0.9,
        area: 1800,
        units: 40,
        availableUnits: 8,
        status: "LIMITED",
        description:
          "Urban Pearl is a boutique residential project in the vibrant neighborhood of Indiranagar. Known for its cafes, restaurants, and nightlife, this location offers an unmatched lifestyle experience. The property combines modern architecture with smart home features, making it ideal for both living and investment.",
        highlights: [
          "RERA Registered",
          "Smart Home Features",
          "Rooftop Garden",
          "Co-working Space",
          "EV Charging",
          "Prime Location",
          "Metro Adjacent",
          "Limited Units Left",
        ],
        images: [
          "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
          "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80",
          "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80",
        ],
        reraRegistered: true,
        readyToMove: false,
        type: "Residential",
      },
    }),
    prisma.property.create({
      data: {
        name: "Golden Gate Residency",
        location: "80 Feet Road, Koramangala",
        city: "Bangalore",
        price: 85000000,
        expectedROI: 15,
        monthlyYield: 1.2,
        area: 4000,
        units: 25,
        availableUnits: 15,
        status: "AVAILABLE",
        description:
          "Golden Gate Residency is a landmark project in Koramangala, Bangalore's startup hub. This premium property offers spacious units with panoramic city views, world-class amenities, and excellent connectivity. With the highest projected ROI in our portfolio, it represents a premier investment opportunity.",
        highlights: [
          "RERA Registered",
          "Ready to Move",
          "Panoramic Views",
          "Infinity Pool",
          "Spa & Wellness",
          "Business Center",
          "Startup Hub Location",
          "High ROI Potential",
        ],
        images: [
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
          "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80",
          "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
        ],
        reraRegistered: true,
        readyToMove: true,
        type: "Residential",
      },
    }),
    prisma.property.create({
      data: {
        name: "Lakeside Villas",
        location: "Varthur Lake Road",
        city: "Bangalore",
        price: 60000000,
        expectedROI: 13,
        monthlyYield: 1.0,
        area: 3000,
        units: 20,
        availableUnits: 12,
        status: "AVAILABLE",
        description:
          "Lakeside Villas offers a serene living experience next to Varthur Lake. These spacious villas combine luxury with nature, featuring private gardens, lake-facing balconies, and eco-friendly design. An ideal choice for investors seeking premium properties with strong appreciation potential.",
        highlights: [
          "RERA Registered",
          "Lake Facing",
          "Private Gardens",
          "Eco-Friendly",
          "Solar Powered",
          "Rainwater Harvesting",
          "Gated Community",
          "Nature Trail",
        ],
        images: [
          "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
        ],
        reraRegistered: true,
        readyToMove: true,
        type: "Residential",
      },
    }),
    prisma.property.create({
      data: {
        name: "Tech Park Towers",
        location: "Outer Ring Road, Marathahalli",
        city: "Bangalore",
        price: 55000000,
        expectedROI: 10,
        monthlyYield: 0.8,
        area: 2200,
        units: 35,
        availableUnits: 25,
        status: "AVAILABLE",
        description:
          "Tech Park Towers is strategically located on the Outer Ring Road, providing seamless connectivity to all major IT corridors. This modern residential complex offers comfortable living spaces with excellent amenities, making it a solid investment with consistent rental demand from IT professionals.",
        highlights: [
          "RERA Registered",
          "Ready to Move",
          "IT Corridor",
          "Shopping Mall Nearby",
          "Hospital Nearby",
          "School Proximity",
          "Bus Rapid Transit",
          "Consistent Rental Demand",
        ],
        images: [
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
          "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&q=80",
          "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&q=80",
        ],
        reraRegistered: true,
        readyToMove: true,
        type: "Residential",
      },
    }),
  ]);

  console.log(`Seeded ${properties.length} properties.`);

  // Seed Land Plots
  const plots = await Promise.all([
    prisma.landPlot.create({
      data: {
        name: "Green Valley Plot",
        location: "Sector 12, Plot 345, Sohna Road",
        city: "Gurgaon",
        totalArea: 2000,
        pricePerSqft: 8000,
        minArea: 200,
        amenities: [
          "24/7 Security",
          "Paved Roads",
          "Gated Community",
          "Water Supply",
          "Electricity",
          "Park Nearby",
        ],
        description:
          "Green Valley Plot is a premium residential plot in Sector 12, Gurgaon. Located along Sohna Road with excellent connectivity to NH-48 and upcoming metro stations. The plot is part of a gated community with modern infrastructure, making it perfect for building your dream home or for investment purposes.",
        images: [
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
          "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&q=80",
        ],
      },
    }),
    prisma.landPlot.create({
      data: {
        name: "Sunrise Acres",
        location: "Phase 4, Block C, Greater Noida Expressway",
        city: "Noida",
        totalArea: 1500,
        pricePerSqft: 6000,
        minArea: 150,
        amenities: [
          "24/7 Security",
          "Paved Roads",
          "Gated Community",
          "Gymnasium",
          "Parking",
          "Club House",
        ],
        description:
          "Sunrise Acres offers premium plots along the Greater Noida Expressway with rapid development and appreciation potential. The area is witnessing massive infrastructure growth with the upcoming Jewar Airport nearby, making it an excellent long-term investment opportunity.",
        images: [
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
        ],
      },
    }),
    prisma.landPlot.create({
      data: {
        name: "Tech Park Land",
        location: "IT Corridor, Plot 78, HITEC City",
        city: "Hyderabad",
        totalArea: 1000,
        pricePerSqft: 5000,
        minArea: 100,
        amenities: [
          "Loading Dock",
          "Parking",
          "Paved Roads",
          "Commercial Zoning",
          "Water Supply",
          "Power Backup",
        ],
        description:
          "Tech Park Land is a commercial plot located in the prestigious HITEC City IT Corridor of Hyderabad. Ideal for setting up an office or commercial establishment in one of India's fastest-growing tech hubs. The plot comes with all necessary approvals and infrastructure.",
        images: [
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
          "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
        ],
      },
    }),
  ]);

  console.log(`Seeded ${plots.length} land plots.`);

  // Seed PG Listings
  const pgs = await Promise.all([
    prisma.pGListing.create({
      data: {
        name: "Sky View PG",
        location: "4th Block, Koramangala",
        city: "Bangalore",
        monthlyRent: 12000,
        roomType: "Double",
        amenities: [
          "WiFi",
          "AC",
          "Attached Bathroom",
          "Power Backup",
          "Laundry",
          "Housekeeping",
        ],
        contactPhone: "+91 98978 80441",
        description:
          "Sky View PG offers comfortable double-sharing rooms in the heart of Koramangala. With modern amenities, high-speed WiFi, and proximity to major IT companies and restaurants, it's the perfect home away from home for working professionals and students.",
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
        ],
        available: true,
      },
    }),
    prisma.pGListing.create({
      data: {
        name: "Home Away Home",
        location: "ITPL Main Road, Whitefield",
        city: "Bangalore",
        monthlyRent: 15000,
        roomType: "Single",
        amenities: [
          "WiFi",
          "AC",
          "Kitchen Access",
          "Mess/Food",
          "Gym",
          "CCTV",
        ],
        contactPhone: "+91 98978 80441",
        description:
          "Home Away Home is a premium single-occupancy PG in Whitefield, designed for professionals who value their privacy. The PG offers homely meals, a fully equipped gym, and a collaborative workspace. Located minutes from ITPL and major tech parks.",
        images: [
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
          "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
        ],
        available: true,
      },
    }),
    prisma.pGListing.create({
      data: {
        name: "Delhi Heights PG",
        location: "Sector 12, Dwarka",
        city: "Delhi",
        monthlyRent: 10000,
        roomType: "Triple",
        amenities: [
          "WiFi",
          "Hot Water",
          "Power Backup",
          "Attached Bathroom",
          "TV Room",
          "Parking",
        ],
        contactPhone: "+91 98978 80441",
        description:
          "Delhi Heights PG is an affordable triple-sharing accommodation in Dwarka, one of Delhi's well-planned residential areas. With excellent metro connectivity, clean rooms, and essential amenities, it's ideal for students and young professionals looking for budget-friendly housing.",
        images: [
          "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
          "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
        ],
        available: true,
      },
    }),
  ]);

  console.log(`Seeded ${pgs.length} PG listings.`);

  // Seed Testimonials
  const testimonials = await Promise.all([
    prisma.testimonial.create({
      data: {
        name: "Rajesh Kumar",
        designation: "Senior Software Engineer",
        company: "TCS",
        content:
          "Destates made real estate investing incredibly simple and transparent. I invested in Skyline Heights and have been receiving consistent monthly returns. The fractional ownership model is brilliant for people like me who want to invest in premium properties without the full capital commitment.",
        rating: 5,
      },
    }),
    prisma.testimonial.create({
      data: {
        name: "Priya Sharma",
        designation: "Business Owner",
        company: "Sharma Enterprises",
        content:
          "As a business owner, I appreciate the professionalism and transparency that Destates brings to real estate investment. Their RERA-registered properties give me confidence, and the digital process makes everything hassle-free. My portfolio has grown 15% since I started investing.",
        rating: 5,
      },
    }),
    prisma.testimonial.create({
      data: {
        name: "Amit Patel",
        designation: "Financial Analyst",
        company: "HDFC Bank",
        content:
          "Being in finance, I'm very particular about where I invest my money. Destates offers the kind of due diligence and transparency that I look for. The expected ROI projections have been accurate, and the rental yields are consistent. Highly recommended for serious investors.",
        rating: 5,
      },
    }),
  ]);

  console.log(`Seeded ${testimonials.length} testimonials.`);

  // Seed Admin User
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@destates.in",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("Seeded admin user (admin@destates.in / admin123).");

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
