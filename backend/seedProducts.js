const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://vivek:vivek123@cluster0.dcqiekf.mongodb.net/?appName=Cluster0/test")

const Product = mongoose.model("Product", new mongoose.Schema({
  name: String,
  brand: String,
  category: String,
  price: Number,
  discount: String,
  description: String,
  sizes: [String],
  stock: Number,
  isActive: Boolean,
  images: [String],
  popularityScore: Number
}))

const brands = [
  "Nike","Adidas","Puma","Roadster","Levis",
  "H&M","Zara","ONLY","UCB","HRX"
]

const categories = ["Men","Women","Kids","Beauty"]

const menProducts = [
  "Running Shoes",
  "Casual Shirt",
  "Denim Jeans",
  "Sports Jacket",
  "Polo T-Shirt",
  "Formal Shirt",
  "Hoodie",
  "Cargo Pants"
]

const womenProducts = [
  "Summer Dress",
  "Floral Top",
  "High Waist Jeans",
  "Kurti",
  "Denim Jacket",
  "Party Gown",
  "Crop Top",
  "Maxi Dress"
]

const kidsProducts = [
  "Kids T-Shirt",
  "Kids Sneakers",
  "Cartoon Hoodie",
  "Kids Shorts",
  "Kids Jacket",
  "School Shoes",
  "Kids Jeans"
]

const beautyProducts = [
  "Lipstick",
  "Face Wash",
  "Perfume",
  "Moisturizer",
  "Foundation",
  "Sunscreen",
  "Eyeliner"
]

const images = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
  "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500",
  "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500"
]

function random(arr){
  return arr[Math.floor(Math.random()*arr.length)]
}

function randomPrice(){
  return Math.floor(Math.random()*4000)+500
}

async function seedProducts(){

  const products = []

  for(let i=0;i<120;i++){

    let category = random(categories)

    let name

    if(category==="Men") name=random(menProducts)
    if(category==="Women") name=random(womenProducts)
    if(category==="Kids") name=random(kidsProducts)
    if(category==="Beauty") name=random(beautyProducts)

    products.push({
      name,
      brand: random(brands),
      category,
      price: randomPrice(),
      discount: `${Math.floor(Math.random()*60)+10}% OFF`,
      description: "Premium quality product designed for comfort and style.",
      sizes: ["S","M","L","XL"],
      stock: 20,
      isActive: true,
      images: [random(images)],
      popularityScore: Math.floor(Math.random()*1000)
    })

  }

  await Product.insertMany(products)

  console.log("120 products inserted")

  mongoose.disconnect()
}

seedProducts()