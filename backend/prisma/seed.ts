import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  // CLEAN TABLES

  await prisma.review.deleteMany();

  await prisma.schedule.deleteMany();

  await prisma.gym.deleteMany();

  await prisma.user.deleteMany();

  // USERS

  const admin = await prisma.user.create({
    data: {
      auth0Id: "auth0|admin001",

      email: "admin@gymfit.com",

      name: "Admin User",

      picture: "https://i.pravatar.cc/300",

      role: "ADMIN",
    },
  });

  const user1 = await prisma.user.create({
    data: {
      auth0Id: "auth0|user001",

      email: "alex@gmail.com",

      name: "Alex",

      picture: "https://i.pravatar.cc/301",

      role: "USER",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      auth0Id: "auth0|user002",

      email: "emma@gmail.com",

      name: "Emma",

      picture: "https://i.pravatar.cc/302",

      role: "USER",
    },
  });

  // GYMS

  const gym1 = await prisma.gym.create({
    data: {
      name: "Pulse Fitness2",

      location: "Stockholm",

      description: "Modern gym with cardio and group classes",

      membershipPrice: 499,

      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48",

      rating: 4.9,
    },
  });

  const gym2 = await prisma.gym.create({
    data: {
      name: "Elite Gym",

      location: "Malmö",

      description: "Strength training and bodybuilding",

      membershipPrice: 699,

      imageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f",

      rating: 4.7,
    },
  });

  const gym3 = await prisma.gym.create({
    data: {
      name: "Nordic Active",

      location: "Uppsala",

      description: "Affordable family fitness",

      membershipPrice: 399,

      imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",

      rating: 4.4,
    },
  });

  const gym4 = await prisma.gym.create({
    data: {
      name: "Titan Performance",

      location: "Gothenburg",

      description: "Professional athlete training",

      membershipPrice: 899,

      imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61",

      rating: 5,
    },
  });

  // REVIEWS

  await prisma.review.createMany({
    data: [
      {
        rating: 5,

        comment: "Excellent equipment and clean environment",

        userId: user1.id,

        gymId: gym1.id,
      },

      {
        rating: 4,

        comment: "Friendly trainers and great atmosphere",

        userId: user2.id,

        gymId: gym2.id,
      },

      {
        rating: 5,

        comment: "Best gym experience so far",

        userId: admin.id,

        gymId: gym4.id,
      },
    ],
  });

  // SCHEDULES

  await prisma.schedule.createMany({
    data: [
      {
        title: "Chest Workout",

        date: new Date("2026-06-01"),

        startTime: new Date("2026-06-01T09:00:00"),

        endTime: new Date("2026-06-01T10:30:00"),

        userId: user1.id,

        gymId: gym1.id,
      },

      {
        title: "Yoga Session",

        date: new Date("2026-06-02"),

        startTime: new Date("2026-06-02T18:00:00"),

        endTime: new Date("2026-06-02T19:00:00"),

        userId: user2.id,

        gymId: gym3.id,
      },

      {
        title: "Strength Training",

        date: new Date("2026-06-03"),

        startTime: new Date("2026-06-03T17:00:00"),

        endTime: new Date("2026-06-03T19:00:00"),

        userId: admin.id,

        gymId: gym4.id,
      },
    ],
  });

  console.log("Database refreshed");
}

// seed();
// .catch((e) => {

// console.error(e);

// process.exit(1);

// })
// .finally(async()=>{

// await prisma.$disconnect();

// });

seed().then(() => prisma.$disconnect());
