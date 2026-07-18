-- ============================================================
-- MIGRATION v4: Full CMS content for all pages
-- Run this in your Neon SQL console
-- ============================================================

CREATE TABLE IF NOT EXISTS website_content (
  id         uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  section    varchar(100) NOT NULL UNIQUE,
  content    jsonb        NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp    NOT NULL DEFAULT now()
);

INSERT INTO website_content (section, content) VALUES

('home_hero', '{
  "backgroundImage": "https://res.cloudinary.com/dzpswgjsm/image/upload/f_auto,q_auto,w_1920/homys-static/hero.png",
  "showListPropertyButton": true
}'::jsonb),

('home_services', '{
  "sectionLabel": "SERVICES",
  "cards": [
    {"id":1,"title":"Hospitality","image":"https://res.cloudinary.com/dzpswgjsm/image/upload/f_auto,q_auto,w_600/homys-static/Frame_1.png"},
    {"id":2,"title":"Maintenance","image":""},
    {"id":3,"title":"Experience","image":""}
  ]
}'::jsonb),

('home_sea', '{
  "title": "Homys comfort\nwith hotel standards",
  "subtitle": "At Homys, every property is professionally managed, rigorously inspected, and prepared with hotel-grade attention to detail. Crisp linens, spotless interiors, and a responsive team on standby — because a true sanctuary never compromises on quality.",
  "buttonText": "Details",
  "buttonLink": "/AboutUs"
}'::jsonb),

('home_quiz', '{
  "tag": "PERSONALIZED GUIDANCE",
  "title": "Not sure where to start?",
  "subtitle": "Answer 5 simple questions about your dream stay, and our AI will instantly find the perfect sanctuaries tailored to your lifestyle.",
  "buttonText": "Take the Quiz",
  "image": ""
}'::jsonb),

('home_destinations', '{
  "sectionTitle": "Your Next Stay,\nThoughtfully Chosen.",
  "sectionSubtitle": "From coastal retreats along Egypt''s serene shores to refined city sanctuaries in the heart of Cairo, every Homys property is carefully selected for its distinctive character, vibrant community, and elevated standard of living.",
  "exploreButtonText": "Explore More",
  "destinations": [
    {"id":1,"title":"Gouna","keyword":"Gouna","image":""},
    {"id":2,"title":"Fouka Bay","keyword":"Fouka","image":""},
    {"id":3,"title":"Mountain View","keyword":"Mountain","image":""},
    {"id":4,"title":"Almaza Bay","keyword":"Almaza","image":""}
  ]
}'::jsonb),

('home_about', '{
  "heading": "More than a stay\na story worth telling.",
  "subtext": "Homys is where curated design meets genuine Egyptian hospitality. Whether you''re chasing the Sahel sun or escaping to a Cairo penthouse, every property we manage reflects our obsession with quality, comfort, and the art of feeling at home wherever you are.",
  "buttonText": "Read More",
  "image1": "",
  "image2": "",
  "logo": ""
}'::jsonb),

('home_list_property', '{
  "tag": "FOR PROPERTY OWNERS",
  "title": "Turn your home into a premium sanctuary.",
  "subtitle": "Join the Homys collection and reach global travelers looking for exclusive stays. We handle the management, while you enjoy the returns on your investment.",
  "benefits": ["Full management & cleaning","24/7 Guest communication","Optimized pricing for high returns"],
  "buttonText": "List Your Property",
  "image": ""
}'::jsonb),

('home_faqs', '{
  "sectionTitle": "FAQs",
  "showMoreButtonText": "Show More",
  "items": [
    {"id":"01","question":"What makes Homys different from regular rentals?","answer":"Homys properties are professionally managed, rigorously inspected, and prepared with hotel-grade attention to detail."},
    {"id":"02","question":"How do I book a Homys property?","answer":"Browse our stays page, choose your property, select dates, and follow the checkout process."},
    {"id":"03","question":"Can I list my property on Homys?","answer":"Yes! Click ''List Your Property'' and submit your details for review."},
    {"id":"04","question":"Do you offer both short stays and longer rentals?","answer":"We offer flexible options — from weekend escapes to extended monthly stays."}
  ]
}'::jsonb),

('stays_hero', '{
  "backgroundImage": "https://res.cloudinary.com/dzpswgjsm/image/upload/f_auto,q_auto,w_1920/homys-static/StaysHero.png",
  "filterPills": ["All","Fouka Bay","Almaza Bay","Mountain View"]
}'::jsonb),

('stays_partners', '{
  "title": "Explore Our Upcoming Partners & Stays",
  "featuredImage": "https://res.cloudinary.com/dzpswgjsm/image/upload/f_auto,q_auto,w_800/homys-static/Group_14.png",
  "featuredTitle": "Forums",
  "featuredSubtitle": "Premium coastal experiences curated for you.",
  "thumbnails": ["","","",""]
}'::jsonb),

('about_hero', '{
  "headline": "We believe\nhome is more\nthan a place.",
  "highlightWord": "home",
  "subtext": "Homys was founded on the idea that luxury and comfort should be accessible to everyone who seeks a sanctuary by the sea or in the heart of the city."
}'::jsonb),

('about_mission', '{
  "bannerText": "Homys was born from a desire to redefine the concept of home.",
  "splitImage": "https://res.cloudinary.com/dzpswgjsm/image/upload/f_auto,q_auto,w_800/homys-static/Group_14.png",
  "splitTitle": "Finding the soul in modern living.",
  "splitText": "Every property we manage is hand-picked for its unique character. We don''t just provide rooms; we provide the backdrop for your most cherished memories."
}'::jsonb),

('about_stats', '{
  "stats": [
    {"value":"12","suffix":"+","label":"Destinations"},
    {"value":"5000","suffix":"+","label":"Happy Guests"},
    {"value":"30000","suffix":"+","label":"Nights Booked"},
    {"value":"88","suffix":"%","label":"Return Rate"}
  ]
}'::jsonb),

('about_why', '{
  "sectionTitle": "Why Choose Homys?",
  "cards": [
    {"title":"Trusted Security","text":"We prioritize your safety with state-of-the-art security systems and 24/7 on-site presence."},
    {"title":"Verified Quality","text":"Every home undergoes a 100-point inspection to meet our elite hospitality standards."},
    {"title":"Effortless Booking","text":"Simple, transparent, and fast booking process with instant confirmation and flexible dates."},
    {"title":"Prime Locations","text":"Strategically located properties that put you at the heart of the most vibrant communities."}
  ]
}'::jsonb),

('about_founders', '{
  "sectionTitle": "Our Founders",
  "founders": [
    {"name":"Mohamed Magdy","role":"Co-Founder & CEO","bio":"A visionary leader with over a decade of experience in real estate and hospitality.","image":""},
    {"name":"Korashy","role":"Co-Founder & COO","bio":"Ensuring every Homys property operates with the highest level of care and precision.","image":""}
  ]
}'::jsonb),

('about_timeline', '{
  "sectionTitle": "The Journey So Far",
  "items": [
    {"year":"2021","text":"Homys officially launched with 3 coastal properties, planting the seed of a new era in Egyptian hospitality."},
    {"year":"2022","text":"Expanded into city sanctuaries in the heart of Cairo, bringing the Homys experience to urban travelers."},
    {"year":"2023","text":"Voted ''Best Emerging Hospitality Brand'' in the region — a testament to our relentless pursuit of excellence."},
    {"year":"2024","text":"Reached our 50th property milestone across Egypt, cementing Homys as Egypt''s premier curated rental platform."}
  ]
}'::jsonb),

('about_gallery', '{
  "sectionTitle": "The Newest Style for Your Home",
  "subtitle": "Blending coastal aesthetics with modern luxury to create spaces that feel both exotic and familiar.",
  "images": ["","","",""]
}'::jsonb),

('about_testimonials', '{
  "sectionTitle": "What Our Guests Say",
  "items": [
    {"quote":"The attention to detail in every Homys home is unmatched. It truly felt like a home away from home.","name":"Sarah J.","role":"Guest from UK"},
    {"quote":"Clean, safe, and beautifully designed. The booking process was seamless.","name":"Ahmed M.","role":"Guest from Cairo"},
    {"quote":"Homys has redefined what coastal stays should be. Stunning properties.","name":"Elena R.","role":"Guest from Italy"}
  ]
}'::jsonb),

('about_cta', '{
  "title": "Ready to find your Homys?",
  "subtitle": "Join our community and discover a new way of staying.",
  "primaryButtonText": "Get Started",
  "secondaryButtonText": "Stays"
}'::jsonb),

('contact_page', '{
  "heroTitle": "Let''s Connect",
  "heroSubtitle": "Whether you have a question about our properties or need assistance, we''re here to help.",
  "formTitle": "Send us a Message",
  "officeTitle": "Our Office",
  "officeAddress": "123 Coastal Drive, North Coast\nAlexandria, Egypt",
  "contactTitle": "Contact Details",
  "contactEmail": "hello@homys.com",
  "contactPhone": "+20 123 456 789",
  "hoursTitle": "Working Hours",
  "hours": "Sat - Thu: 9:00 AM - 6:00 PM\nFriday: Closed",
  "instagramUrl": "",
  "facebookUrl": "",
  "linkedinUrl": ""
}'::jsonb),

('faq_page', '{
  "title": "Frequently Asked Questions",
  "ctaTitle": "Still have questions?",
  "ctaSubtitle": "Leave your inquiry below and our team will get back to you shortly.",
  "items": [
    {"id":"01","question":"How do I book a property?","answer":"You can book directly through our stays page by selecting a property and following the checkout process."},
    {"id":"02","question":"What is the cancellation policy?","answer":"Cancellations are free up to 48 hours before your arrival date for most properties."},
    {"id":"03","question":"Are pets allowed in the units?","answer":"Pet policies vary by property. Please check the specific property details or contact support."},
    {"id":"04","question":"Is there a minimum stay requirement?","answer":"Most of our sanctuary homes require a minimum stay of 2 nights."},
    {"id":"05","question":"Do you offer airport transfers?","answer":"Yes, premium airport transfers can be added to your booking during the cart process."}
  ]
}'::jsonb)

ON CONFLICT (section) DO UPDATE
  SET content = EXCLUDED.content,
      updated_at = now();
