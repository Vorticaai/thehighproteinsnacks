#!/usr/bin/env python3
import json

# Product database generation
products = []

# Quest Nutrition (10 products)
quest_products = [
    {
        "name": "Quest Protein Bar Chocolate Chip Cookie Dough",
        "brand": "Quest Nutrition",
        "protein": 21, "calories": 200, "carbs": 21, "fats": 9, "sugar": 1, "fiber": 14,
        "price": 2.49, "serving": "1 bar (60g)", "rating": 4.6, "reviews": 485,
        "categories": ["weight-loss", "low-sugar", "high-fiber"],
        "diets": ["gluten-free", "low-sugar", "keto"],
        "bestFor": ["post-workout", "meal-replacement", "desk-snack", "gym-bag"],
        "image": "photo-1481391032119-d89fee407e44",
        "description": "Quest's bestselling protein bar delivers 21g of complete protein with only 1g sugar and 4g net carbs, making it ideal for both muscle building and fat loss. The cookie dough flavor tastes indulgent without the guilt, using high-quality whey and milk protein isolate. Perfect for active individuals who refuse to compromise on taste while hitting their macros.",
        "whyGreat": "What makes this bar exceptional is its industry-leading macro profile: 21g protein with just 1g sugar and 4g net carbs. The chewy, satisfying texture mimics actual cookie dough, eliminating the chalky aftertaste common in protein bars. Users consistently report 3-4 hours of satiety, making it an effective meal replacement. The 14g of fiber supports digestive health and enhances fullness, while the low sugar content prevents energy crashes and blood sugar spikes.",
        "nutrition": "With 21g protein, 4g net carbs, and 9g fat, this bar provides an optimal macro balance for both cutting and maintenance phases. The 14g of prebiotic fiber (IMO) aids gut health and keeps you full for hours without bloating. At 200 calories, it delivers substantial nutrition while fitting seamlessly into calorie-restricted diets. The protein comes from a blend of whey and milk isolates, ensuring rapid absorption post-workout.",
        "ingredients": "Made with complete milk proteins (whey and milk protein isolate) and sweetened with erythritol and stevia instead of sugar, avoiding insulin spikes. Contains no soy protein isolate or artificial flavors. The fiber comes from isomalto-oligosaccharides (IMO), a prebiotic that supports gut health.",
        "faqs": [
            {"q": "Is this actually low-carb?", "a": "Yes, with only 4g net carbs (total carbs minus fiber), it fits perfectly into keto and low-carb diets under 50g daily carbs."},
            {"q": "Does it taste chalky like other protein bars?", "a": "No, Quest uses a proprietary baking process that creates a chewy, cookie-like texture that customers consistently rate as the best-tasting in the category."},
            {"q": "Will this keep me full for hours?", "a": "Yes, the combination of 21g protein and 14g fiber provides 3-4 hours of satiety according to user reviews, making it an effective meal replacement."},
            {"q": "Is it safe for people with gluten sensitivity?", "a": "Yes, it's certified gluten-free and produced in a dedicated gluten-free facility."},
            {"q": "Can I eat this on a weight loss diet?", "a": "Absolutely. At 200 calories with high protein and fiber, it's designed for fat loss while preserving muscle mass. The low sugar content prevents cravings."}
        ]
    },
    # Add 9 more Quest products...
]

# Generate TypeScript format
def generate_ts():
    ts_objects = []
    for i, p in enumerate(products, 1):
        obj = f'''  {{
    id: "snack-{i}",
    name: "{p['name']}",
    slug: "{slugify(p['name'])}",
    brand: "{p['brand']}",
    categoryTags: {json.dumps(p['categories'])},
    dietTags: {json.dumps(p['diets'])},
    bestFor: {json.dumps(p['bestFor'])},
    proteinPerServing: {p['protein']},
    caloriesPerServing: {p['calories']},
    carbsPerServing: {p['carbs']},
    fatsPerServing: {p['fats']},
    sugarPerServing: {p['sugar']},
    fiberPerServing: {p['fiber']},
    servingSize: "{p['serving']}",
    pricePerUnit: {p['price']},
    currency: "USD",
    rating: {p['rating']},
    reviewCount: {p['reviews']},
    imageUrl: "https://images.unsplash.com/{p['image']}?auto=format&fit=crop&w=600&q=80",
    buyUrl: "https://amazon.com/dp/example",
    description: "{p['description']}",
    whyGreat: "{p['whyGreat']}",
    nutritionBreakdown: "{p['nutrition']}",
    ingredientsHighlight: "{p['ingredients']}",
    shortBenefits: {json.dumps(p.get('benefits', [p['description'][:80]]))},
    faq: {json.dumps(p['faqs'], indent=6).replace('"q":', '"question":').replace('"a":', '"answer":')}
  }}'''
        ts_objects.append(obj)
    
    return ',\n'.join(ts_objects)

def slugify(text):
    return text.lower().replace(' ', '-').replace('(', '').replace(')', '').replace("'", '')

# Write to file
with open('data/snacks_generated.ts', 'w') as f:
    f.write(generate_ts())
    
print("Generated snacks database")
