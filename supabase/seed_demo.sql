-- ============================================================
-- SEEKERS DEMO SEED DATA
-- ============================================================
-- Run this against your Supabase DB to populate demo data.
-- All demo rows are tagged with metadata->>'demo' = 'true'
-- or use the teardown script (seed_demo_teardown.sql) to remove.
--
-- Usage (Supabase CLI):
--   supabase db execute --file supabase/seed_demo.sql
-- ============================================================

-- ============================================================
-- 1. Fake auth users (needed for profile FK)
-- ============================================================
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values
  ('d1000001-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','arjun.demo@seekers.test','',now(),now(),now(),'{"provider":"email","providers":["email"]}','{}',false,'','','',''),
  ('d1000001-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','priya.demo@seekers.test','',now(),now(),now(),'{"provider":"email","providers":["email"]}','{}',false,'','','',''),
  ('d1000001-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','rahul.demo@seekers.test','',now(),now(),now(),'{"provider":"email","providers":["email"]}','{}',false,'','','',''),
  ('d1000001-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','sneha.demo@seekers.test','',now(),now(),now(),'{"provider":"email","providers":["email"]}','{}',false,'','','',''),
  ('d1000001-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated','vikram.demo@seekers.test','',now(),now(),now(),'{"provider":"email","providers":["email"]}','{}',false,'','','',''),
  ('d1000001-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000000','authenticated','authenticated','meera.demo@seekers.test','',now(),now(),now(),'{"provider":"email","providers":["email"]}','{}',false,'','','',''),
  ('d1000001-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000000','authenticated','authenticated','karan.demo@seekers.test','',now(),now(),now(),'{"provider":"email","providers":["email"]}','{}',false,'','','',''),
  ('d1000001-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000000','authenticated','authenticated','divya.demo@seekers.test','',now(),now(),now(),'{"provider":"email","providers":["email"]}','{}',false,'','','',''),
  ('d1000001-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000000','authenticated','authenticated','rohit.demo@seekers.test','',now(),now(),now(),'{"provider":"email","providers":["email"]}','{}',false,'','','',''),
  ('d1000001-0000-0000-0000-00000000000a','00000000-0000-0000-0000-000000000000','authenticated','authenticated','anita.demo@seekers.test','',now(),now(),now(),'{"provider":"email","providers":["email"]}','{}',false,'','','','')
on conflict (id) do nothing;

-- ============================================================
-- 2. Profiles
-- ============================================================
insert into profiles (id, user_id, name, designation, company, industry, location, bio, directory_visible, leaderboard_opt_in, invite_code) values
  ('a0000001-0000-0000-0000-000000000001','d1000001-0000-0000-0000-000000000001','Arjun Mehta','Co-Founder','NovaTech Labs','Technology','Mumbai','Building the future of fintech. Previously at Razorpay. Love connecting founders with the right people.',true,true,'DEMO-ARJ1'),
  ('a0000001-0000-0000-0000-000000000002','d1000001-0000-0000-0000-000000000002','Priya Sharma','CFO','Sharma & Associates','Finance & Banking','Delhi','Chartered accountant with 15 years in corporate finance. Happy to help members navigate compliance.',true,true,'DEMO-PRI2'),
  ('a0000001-0000-0000-0000-000000000003','d1000001-0000-0000-0000-000000000003','Rahul Nair','Founder & CEO','GreenBuild Infra','Construction','Bangalore','Developer of sustainable commercial spaces. Always looking for quality vendors and reliable contractors.',true,true,'DEMO-RAH3'),
  ('a0000001-0000-0000-0000-000000000004','d1000001-0000-0000-0000-000000000004','Sneha Kapoor','Head of Marketing','BrandSpark Agency','Media & Marketing','Mumbai','Performance marketing specialist. Have worked with 50+ D2C brands to scale digital presence.',true,false,'DEMO-SNE4'),
  ('a0000001-0000-0000-0000-000000000005','d1000001-0000-0000-0000-000000000005','Vikram Bose','Managing Director','Bose Logistics','Logistics','Chennai','Third-generation logistics business serving pan-India. Specialise in cold chain and pharma logistics.',true,true,'DEMO-VIK5'),
  ('a0000001-0000-0000-0000-000000000006','d1000001-0000-0000-0000-000000000006','Meera Iyer','Partner','Iyer Family Office','Investment & Wealth','Hyderabad','Managing family office investments across real estate, listed equities and private credit.',true,false,'DEMO-MEE6'),
  ('a0000001-0000-0000-0000-000000000007','d1000001-0000-0000-0000-000000000007','Karan Malhotra','Founder','FoodBox India','Food & Hospitality','Pune','Cloud kitchen network with 12 brands across Pune and Mumbai. Obsessed with food quality and ops.',true,true,'DEMO-KAR7'),
  ('a0000001-0000-0000-0000-000000000008','d1000001-0000-0000-0000-000000000008','Divya Reddy','Director','MedCare Diagnostics','Healthcare','Bangalore','Built a chain of 9 diagnostic centres across Karnataka. Passionate about affordable diagnostics.',true,false,'DEMO-DIV8'),
  ('a0000001-0000-0000-0000-000000000009','d1000001-0000-0000-0000-000000000009','Rohit Joshi','VP Engineering','CodeStack','Technology','Bangalore','Ex-Flipkart engineer. Now building a B2B SaaS for SME inventory management. Open to consulting.',true,true,'DEMO-ROH9'),
  ('a0000001-0000-0000-0000-00000000000a','d1000001-0000-0000-0000-00000000000a','Anita Patel','Director','Patel Realty Group','Real Estate','Ahmedabad','20+ years in commercial and residential real estate across Gujarat. Trusted by 300+ families.',true,false,'DEMO-ANI0')
on conflict (id) do nothing;

-- ============================================================
-- 3. Extra categories (non-regulated, for directory demo)
-- ============================================================
insert into categories (id, slug, name, referral_fee_allowed) values
  ('c0000001-0000-0000-0000-000000000001','technology','Technology',true),
  ('c0000001-0000-0000-0000-000000000002','real-estate','Real Estate',true),
  ('c0000001-0000-0000-0000-000000000003','logistics','Logistics',true),
  ('c0000001-0000-0000-0000-000000000004','marketing','Marketing & Branding',true),
  ('c0000001-0000-0000-0000-000000000005','healthcare','Healthcare',true),
  ('c0000001-0000-0000-0000-000000000006','food-hospitality','Food & Hospitality',true),
  ('c0000001-0000-0000-0000-000000000007','construction','Construction',true)
on conflict (slug) do nothing;

-- ============================================================
-- 4. Business profiles
-- ============================================================
insert into business_profiles (id, owner_id, name, slug, type, category_id, bio, location, years, website, approval_status, approved_at) values
  ('b0000001-0000-0000-0000-000000000001','a0000001-0000-0000-0000-000000000001','NovaTech Labs','novatech-labs','business','c0000001-0000-0000-0000-000000000001','We build fintech infrastructure for banks and NBFCs — from UPI payment rails to lending APIs. Trusted by 40+ FIs across India.','Mumbai',4,'https://novatech.example','approved',now()),
  ('b0000001-0000-0000-0000-000000000002','a0000001-0000-0000-0000-000000000003','GreenBuild Infra','greenbuild-infra','business','c0000001-0000-0000-0000-000000000007','IGBC-certified commercial construction with a focus on green buildings. Delivered 18 projects > ₹50 cr each.','Bangalore',9,'https://greenbuild.example','approved',now()),
  ('b0000001-0000-0000-0000-000000000003','a0000001-0000-0000-0000-000000000004','BrandSpark Agency','brandspark-agency','business','c0000001-0000-0000-0000-000000000004','Full-stack performance marketing: Meta, Google, Programmatic. Average ROAS of 4.2× for our portfolio clients.','Mumbai',6,null,'approved',now()),
  ('b0000001-0000-0000-0000-000000000004','a0000001-0000-0000-0000-000000000005','Bose Logistics','bose-logistics','business','c0000001-0000-0000-0000-000000000003','Pan-India cold chain and ambient logistics. ISO 9001 certified fleet of 280 vehicles with real-time tracking.','Chennai',32,'https://boselogistics.example','approved',now()),
  ('b0000001-0000-0000-0000-000000000005','a0000001-0000-0000-0000-000000000007','FoodBox India','foodbox-india','business','c0000001-0000-0000-0000-000000000006','12 cloud kitchen brands under one roof. Franchise opportunities available across Tier 1 and 2 cities.','Pune',3,null,'approved',now()),
  ('b0000001-0000-0000-0000-000000000006','a0000001-0000-0000-0000-000000000008','MedCare Diagnostics','medcare-diagnostics','business','c0000001-0000-0000-0000-000000000005','NABL-accredited diagnostics with home collection across 9 centres in Karnataka. 300+ tests available.','Bangalore',11,'https://medcare.example','approved',now()),
  ('b0000001-0000-0000-0000-000000000007','a0000001-0000-0000-0000-000000000009','CodeStack','codestack','business','c0000001-0000-0000-0000-000000000001','Inventory management SaaS purpose-built for Indian SMEs. ERPNext alternative with WhatsApp-native UX.','Bangalore',2,'https://codestack.example','approved',now()),
  ('b0000001-0000-0000-0000-000000000008','a0000001-0000-0000-0000-00000000000a','Patel Realty Group','patel-realty','business','c0000001-0000-0000-0000-000000000002','Commercial and residential real estate across Gujarat. Specialist in SEZ leasing and industrial plots.','Ahmedabad',22,'https://patelrealty.example','approved',now())
on conflict (id) do nothing;

-- ============================================================
-- 5. Catalogue items (products/services per business)
-- ============================================================
insert into catalogue_items (id, business_id, title, description, price_paise, price_label) values
  ('c4000001-0000-0000-0000-000000000001','b0000001-0000-0000-0000-000000000001','UPI Payment Integration','Full-stack UPI integration with fallback rails and reconciliation dashboard.',500000000,'₹50L setup + rev share'),
  ('c4000001-0000-0000-0000-000000000002','b0000001-0000-0000-0000-000000000001','Lending API Suite','Co-lending and BNPL APIs with bureau pull, decisioning engine and disbursement.',300000000,'₹30L/year'),
  ('c4000001-0000-0000-0000-000000000003','b0000001-0000-0000-0000-000000000003','Performance Marketing Retainer','Meta + Google campaigns with weekly reporting. Dedicated account manager.',15000000,'₹1.5L/month'),
  ('c4000001-0000-0000-0000-000000000004','b0000001-0000-0000-0000-000000000003','Brand Identity Package','Logo, brand guidelines, pitch deck and 30-day social media content calendar.',8000000,'₹80K one-time'),
  ('c4000001-0000-0000-0000-000000000005','b0000001-0000-0000-0000-000000000004','Cold Chain Mumbai–Delhi','Temperature-controlled transit for pharma and perishables.',null,'Quote on request'),
  ('c4000001-0000-0000-0000-000000000006','b0000001-0000-0000-0000-000000000007','CodeStack Starter','Up to 5 users, 1 warehouse, unlimited SKUs.',199900,'₹1,999/month'),
  ('c4000001-0000-0000-0000-000000000007','b0000001-0000-0000-0000-000000000007','CodeStack Growth','Up to 25 users, multi-warehouse, GST e-invoicing, API access.',499900,'₹4,999/month')
on conflict (id) do nothing;

-- ============================================================
-- 6. Referrals (mix of states for demo)
-- ============================================================
insert into referrals (id, code, type, referrer_id, business_id, seeker_id, state, deal_value_paise, credits, created_at) values
  ('ee000001-0000-0000-0000-000000000001','REF-DEMO0001','self_service','a0000001-0000-0000-0000-000000000001','b0000001-0000-0000-0000-000000000003','a0000001-0000-0000-0000-000000000006','CLOSED_WON',500000000,5000,now() - interval '60 days'),
  ('ee000001-0000-0000-0000-000000000002','REF-DEMO0002','self_service','a0000001-0000-0000-0000-000000000003','b0000001-0000-0000-0000-000000000001','a0000001-0000-0000-0000-000000000009','ACCEPTED',null,null,now() - interval '10 days'),
  ('ee000001-0000-0000-0000-000000000003','REF-DEMO0003','self_service','a0000001-0000-0000-0000-000000000007','b0000001-0000-0000-0000-000000000004','a0000001-0000-0000-0000-000000000002','IN_PROGRESS',null,null,now() - interval '5 days'),
  ('ee000001-0000-0000-0000-000000000004','REF-DEMO0004','self_service','a0000001-0000-0000-0000-000000000005','b0000001-0000-0000-0000-000000000007','a0000001-0000-0000-0000-000000000004','CLOSED_WON',120000000,1200,now() - interval '45 days'),
  ('ee000001-0000-0000-0000-000000000005','REF-DEMO0005','self_service','a0000001-0000-0000-0000-000000000009','b0000001-0000-0000-0000-000000000003','a0000001-0000-0000-0000-000000000008','INITIATED',null,null,now() - interval '2 days'),
  ('ee000001-0000-0000-0000-000000000006','REF-DEMO0006','self_service','a0000001-0000-0000-0000-000000000001','b0000001-0000-0000-0000-000000000004','a0000001-0000-0000-0000-000000000003','CLOSED_WON',800000000,8000,now() - interval '90 days'),
  ('ee000001-0000-0000-0000-000000000007','REF-DEMO0007','self_service','a0000001-0000-0000-0000-000000000001','b0000001-0000-0000-0000-000000000006','a0000001-0000-0000-0000-000000000007','CONTACTED',null,null,now() - interval '7 days')
on conflict (id) do nothing;

-- ============================================================
-- 7. Events
-- ============================================================
insert into events (id, slug, title, description, date_time, location, capacity, is_paid, price_paise, host_id, status, cover_image) values
  ('e0000001-0000-0000-0000-000000000001','seekers-founders-dinner-nov','Seekers Founders Dinner — November','An intimate dinner for 30 founders in the community. Great food, honest conversations, no pitching allowed.','2026-11-15 19:30:00+05:30','The Taj Mahal Palace, Mumbai',30,true,500000,'a0000001-0000-0000-0000-000000000001','upcoming',null),
  ('e0000001-0000-0000-0000-000000000002','deal-flow-workshop-nov','Deal Flow Workshop: How to Make Better Referrals','A hands-on workshop on how to identify good referrals, qualify them, and track them to closure. Hosted by Arjun Mehta.','2026-11-22 11:00:00+05:30','Online (Zoom)',100,false,null,'a0000001-0000-0000-0000-000000000001','upcoming',null),
  ('e0000001-0000-0000-0000-000000000003','bangalore-chapter-launch','Bangalore Chapter Launch Meetup','Seekers is coming to Bangalore! Join us for the inaugural meetup with 40+ members from the city.','2026-12-05 18:00:00+05:30','WeWork Galaxy, Bangalore',60,false,null,'a0000001-0000-0000-0000-000000000003','upcoming',null),
  ('e0000001-0000-0000-0000-000000000004','sep-networking-dinner','September Networking Dinner','Sold-out dinner from last quarter — catch the highlights and register interest for December.','2026-09-20 19:30:00+05:30','ITC Grand Central, Mumbai',30,true,500000,'a0000001-0000-0000-0000-000000000001','past',null)
on conflict (id) do nothing;

-- ============================================================
-- 8. Knowledge / Content
-- ============================================================
insert into content (id, url, title, description, category, source, status, author_id, featured) values
  ('c5000001-0000-0000-0000-000000000001','https://example.com/razorpay-payment-links','How Razorpay Payment Links can replace your payment gateway for SMEs','If you are spending ₹30K/month on a payment gateway integration, here is a lighter alternative that takes 30 minutes to set up.','Finance & Banking','member','approved','a0000001-0000-0000-0000-000000000001',true),
  ('c5000001-0000-0000-0000-000000000002','https://example.com/cold-chain-india-guide','Cold Chain in India: What You Need to Know Before Signing a Logistics Contract','Key clauses to look for in pharma logistics agreements — and three common traps that catch first-timers out.','Logistics','member','approved','a0000001-0000-0000-0000-000000000005',false),
  ('c5000001-0000-0000-0000-000000000003','https://example.com/meta-ads-roas','The Meta Ads ROAS playbook for Indian D2C brands in 2026','Our team analysed 50 accounts. Here are the creative formats, bidding strategies and audience types that consistently deliver 4× ROAS.','Media & Marketing','member','approved','a0000001-0000-0000-0000-000000000004',true),
  ('c5000001-0000-0000-0000-000000000004','https://example.com/igbc-green-building','IGBC Green Building certification: timeline, cost and ROI','We got our first IGBC-certified building in 2021. Here is the honest breakdown of cost, timeline and what it actually does for leasing.','Construction','member','approved','a0000001-0000-0000-0000-000000000003',false),
  ('c5000001-0000-0000-0000-000000000005','https://example.com/family-office-india-structure','How to structure a family office in India: SEBI Category II AIF vs LLP','A practical overview of the two most common structures — when each makes sense and the key compliance differences.','Investment & Wealth','member','approved','a0000001-0000-0000-0000-000000000006',false),
  ('c5000001-0000-0000-0000-000000000006','https://example.com/nabl-diagnostic-lab','NABL accreditation for diagnostic labs: step-by-step','We took our first lab through NABL in 18 months. Here is what we wish we had known on day one.','Healthcare','member','approved','a0000001-0000-0000-0000-000000000008',false)
on conflict (id) do nothing;

-- ============================================================
-- 9. Reviews (for the won referrals)
-- ============================================================
insert into reviews (id, type, referral_id, author_profile_id, business_id, rating, text, status) values
  ('c6000001-0000-0000-0000-000000000001','verified','ee000001-0000-0000-0000-000000000001','a0000001-0000-0000-0000-000000000001','b0000001-0000-0000-0000-000000000003',5,'BrandSpark delivered exactly what they promised — ROAS went from 1.8× to 4.1× in 90 days. Highly recommend.','approved'),
  ('c6000001-0000-0000-0000-000000000002','verified','ee000001-0000-0000-0000-000000000004','a0000001-0000-0000-0000-000000000005','b0000001-0000-0000-0000-000000000007',4,'CodeStack onboarding took a week but the WhatsApp-native UX works well for warehouse staff. Solid product.','approved'),
  ('c6000001-0000-0000-0000-000000000003','verified','ee000001-0000-0000-0000-000000000006','a0000001-0000-0000-0000-000000000001','b0000001-0000-0000-0000-000000000004',5,'Bose handled our cross-country cold chain without a single SLA breach over 6 months. Incredible ops.','approved')
on conflict (id) do nothing;
