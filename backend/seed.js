import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import House from "./models/House.js";
import Other from "./models/Other.js";

dotenv.config();

const housesData = [
  {
    _id: "oxala",
    name: "Oxala House",
    shortDescription: {
      fr: "Première résidence de tourisme équitable à Djerba, favorisant les échanges locaux. Un projet contre le tourisme de masse.",
      en: "First fair tourism residence in Djerba, promoting local exchanges. A project against mass tourism.",
    },
    longDescription: {
      fr: "Première résidence de tourisme équitable du projet Tingitingi®. Oxalá House soutient l’économie locale en travaillant avec des prestataires autochtones choisis pour leur intégrité. Elle s'oppose au tourisme de masse et propose une expérience authentique, solidaire et durable, au cœur de l'île de Djerba.",
      en: "The first fair tourism residence of the Tingitingi® project. Oxalá House supports local economies by working with selected indigenous providers. It stands against mass tourism, offering an authentic, sustainable, and community-driven experience at the heart of Djerba.",
    },
    image:
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1745875164/Oxala_Logo1_os9wmc.jpg",
    images: [
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1745875794/S_Oxala-7_vwmmsq.png",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1745875794/S_Oxala-4_g4bpnt.png",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1745875793/S_Oxala-9_dple1v.png",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1745875793/S_Oxala-5_fevg80.png",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1745875791/S_Oxala-8_rqysie.png",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1745875791/S_Oxala-6_fjuc26.png",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1745875790/S_Oxala-2_laqu8s.png",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1745875790/S_Oxala-3_sth0jn.png",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1745875788/S_Oxala-1_dxurej.png",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1745875787/S_Oxala-0_nhwes0.jpg",
    ],
    capacity: null,
    isManuallyUnavailable: false,
  },
  {
    _id: "gaia",
    name: "Dar Gaïa",
    shortDescription: {
      fr: "Havre de paix au cœur d’un Menzel Djerbien, entouré de vergers. Un hommage à la simplicité et à la nature.",
      en: "A peaceful haven inside a Djerbian Menzel, surrounded by orchards. A tribute to simplicity and nature.",
    },
    longDescription: {
      fr: "Seconde maison du projet Tingitingi®, Dar Gaïa célèbre la simplicité volontaire. Cette maison d’hôtes authentique vous plonge dans la vie rurale djerbienne, au sein d’un domaine de 3 hectares de vergers. Elle valorise le patrimoine naturel, culturel et architectural de l’île tout en promouvant un tourisme éthique et respectueux.",
      en: "Second house of the Tingitingi® project, Dar Gaïa celebrates simple living. This authentic guesthouse immerses you in rural Djerbian life, nestled within 3 hectares of orchards. It highlights Djerba’s natural, cultural, and architectural heritage while promoting ethical, respectful tourism.",
    },
    image:
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1745875164/Gaia_Logo1_libeqn.jpg",
    images: [
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746217806/S_Dar-Gaia-3_wyglvh.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746217805/S_Dar-Gaia-2_zqmuxd.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746217805/S_Dar-Gaia-1_iz6oew.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746217804/S_Dar-Gaia-0_gb5xog.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746217801/S_Dar-Gaia-9_xtnyyb.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746217800/S_-Dar-Gaia-7_jznwkj.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746217800/S_Dar-Gaia-8_wldkdt.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746217800/S_Dar-Gaia-6_jk1ldi.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746217800/S_Dar-Gaia-5_ifdnwt.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746217800/S_Dar-Gaia-4_isdgvp.jpg",
    ],
    capacity: null,
    isManuallyUnavailable: false,
  },
  {
    _id: "babel",
    name: "Dar Babel",
    shortDescription: {
      fr: "Maison d’artistes ouverte à la création, à la recherche et aux échanges. Un moteur culturel pour revitaliser le village.",
      en: "Artist residence open to creation, research, and exchange. A cultural hub to revitalize the village.",
    },
    longDescription: {
      fr: "Première maison d’artistes du projet Tingitingi®, Dar Babel accueille artistes, chercheurs et universitaires en quête d'inspiration. Elle favorise les échanges locaux et nourrit la vie culturelle du village. Ce lieu unique tisse des liens entre créativité individuelle et dynamisme communautaire.",
      en: "First artist house of the Tingitingi® project, Dar Babel welcomes artists, researchers, and scholars seeking inspiration. It fosters local connections and enriches the village’s cultural life. This unique space blends personal creativity with community-driven energy.",
    },
    image:
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1745875165/Logo_DarBabel_gifsgn.jpg",
    images: [
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218393/Dar_Babel_-_Entree_Ouest-0_cxoqcf.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218393/Dar_Babel_-_Cote_Bassin-0_ogtjsj.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218392/Dar_Babel_-_Cote_Bassin_2-0_hbo6kr.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218391/Dar_Babel_-_Cote_Bassin_3-0_ohvbuu.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218390/Dar_Babel_-_Bassin-0_sunilk.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218390/Dar_Babel_-_VueGen-0_tsdpx1.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218389/DarBabel-Djerbahood-0_eiwsqh.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218389/Babel-Out4_ismz2t.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218388/Dar_Babel_-_Studio_Khayam-0_v0izq7.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218387/Babel-Out5_fiqjhj.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218387/Dar_Babel_-_Suite_Averroes-0_ngi6yz.jpg",
    ],
    capacity: null,
    isManuallyUnavailable: false,
  },
];

const othersData = [
  {
    _id: "toguna",
    name: "Espace Toguna",
    shortDescription: {
      fr: "Salon de thé culturel mêlant convivialité, lectures et expositions. Un lieu vivant et ouvert.",
      en: "Cultural tea room blending conviviality, reading, and exhibitions. A vibrant, open space.",
    },
    longDescription: {
      fr: "Toguna Café est la case à palabres du projet Tingitingi®, dédiée à la culture, aux rencontres et au partage. Ce salon de thé accueille lectures, discussions et expositions dans une atmosphère détendue. Jardin, patio et terrasses invitent à la rêverie sous les cieux étoilés de Djerba.",
      en: "Toguna Café is the Tingitingi® project's cultural space for conversations, reading, and sharing. This tea room hosts book corners, discussions, and art shows in a relaxed setting. Garden, patio, and terraces open up to Djerba’s starry summer skies.",
    },
    image:
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1745875165/Toguna_mtwemw.jpg",
    images: [
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218567/Toguna_Cafe_-_Salon_4-0_o5avlu.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218566/Toguna_Cafe_-_Salon_3-0_mcdbrt.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218565/Toguna_Cafe_-_Patio-0_hdwfqj.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218564/Toguna_Cafe_-_Jardin-0_am1jvf.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218563/Toguna_Cafe_-_Entree_Jardins-0_pvgdni.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218562/Toguna-6_l8youe.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218561/Toguna-5_yorlgi.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218560/Toguna-4_z2fi5b.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218559/Toguna-1_qlcwv3.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218559/Toguna_Cafe_-_Salon-1_itppbz.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218558/Toguna_Cafe_-_Salon_6_kbrhpw.jpg",
      "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218557/Toguna_Cafe_-_Salon_5-0_hz1xfq.jpg",
    ],
    isManuallyUnavailable: false,
  },
];

const seedDatabase = async () => {
  let caughtError = null;
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("MongoDB connected for seeding...");
    }
    console.log("Deleting existing data...");
    await House.deleteMany({});
    await Other.deleteMany({});
    console.log("Data deleted.");

    console.log("Inserting new data...");
    await House.insertMany(housesData);
    await Other.insertMany(othersData);
    console.log("Data inserted successfully!");
  } catch (error) {
    caughtError = error;
    console.error("Error seeding database:", error);
    if (error.name === "ValidationError") {
      for (let field in error.errors) {
        console.error(
          `Validation Error for field ${field}: ${error.errors[field].message}`
        );
      }
    }
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("MongoDB disconnected.");
    }
    process.exit(caughtError ? 1 : 0);
  }
};
seedDatabase();
