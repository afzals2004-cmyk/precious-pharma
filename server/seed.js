import db from './db.js';

const products = [
    {
        name: "Advanced Vitamin C Serum",
        description: "Brightening serum for radiant skin.",
        price: 29.99,
        category_id: 1, // Skincare
        image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80"
    },
    {
        name: "Premium Omega-3 Fish Oil",
        description: "High potency omega-3 for heart health.",
        price: 24.50,
        category_id: 2, // Supplements
        image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80"
    },
    {
        name: "Organic Sleep Support",
        description: "Natural sleep aid with melatonin and valerian root.",
        price: 19.99,
        category_id: 3, // Wellness
        image_url: "https://images.unsplash.com/photo-1555633514-abadbced61cc?auto=format&fit=crop&w=500&q=80"
    },
    {
        name: "Daily Multivitamin Plus",
        description: "Comprehensive daily vitamin for overall health.",
        price: 35.00,
        category_id: 2, // Supplements
        image_url: "https://images.unsplash.com/photo-1577401239170-6997421dc411?auto=format&fit=crop&w=500&q=80"
    },
    {
        name: "Hydrating Hyaluronic Acid",
        description: "Deep hydration for plumper, smoother skin.",
        price: 42.00,
        category_id: 1, // Skincare
        image_url: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=500&q=80"
    },
    {
        name: "Joint Relief Complex",
        description: "Support flexibility and joint health.",
        price: 28.75,
        category_id: 3, // Pain Relief / Wellness (mapped to wellness for now)
        image_url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=500&q=80"
    }
];

async function seedProducts() {
    try {
        console.log('Seeding products...');
        for (const p of products) {
            await db.query(
                'INSERT INTO products (name, description, price, category_id, image_url) VALUES (?, ?, ?, ?, ?)',
                [p.name, p.description, p.price, p.category_id, p.image_url]
            );
        }
        console.log('Products seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
}

seedProducts();
