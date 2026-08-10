const FAQ = [
  // ---------- Identity & core info ----------
  {
    keywords: ['what is asf', 'about asf', 'who are you', 'what is the fellowship', 'what does asf stand for'],
    answer: "ASF stands for Anglican Students' Fellowship. ASF UNIBEN/UBTH is a Christian fellowship for students of the University of Benin and UBTH, within the Anglican Communion (Church of Nigeria).",
  },
  {
    keywords: ['motto', 'slogan'],
    answer: 'Our motto is "Arise, Shine!" — Isaiah 60 verse 1.',
  },
  {
    keywords: ['vision', 'mission', 'ancient landmark'],
    answer: 'Our vision is "Restoring the Ancient Landmark" (Proverbs 22:28, Jeremiah 6:16) — calling students back to a genuine, historic Christian faith within the Anglican tradition.',
  },
  {
    keywords: ['doctrine', 'doctrinal basis', 'what do you believe', 'beliefs', 'creed'],
    answer: 'We hold to the biblical faith expressed in the Apostles\u2019 Creed, the Nicene Creed and the Thirty-Nine Articles — emphasising a personal knowledge of God, Jesus Christ as Lord and Saviour, and the infilling and work of the Holy Spirit.',
  },
  {
    keywords: ['emblem', 'logo', 'symbol', 'meaning of the colors', 'meaning of colours', 'what does the logo mean'],
    answer: 'The emblem shows an open Bible (the Word of God), a Cross (Christ\u2019s death), a rising sun (our motto, Arise Shine!), and an academic cap (academic excellence). Ox-blood on white represents sanctity through Christ\u2019s blood, and the circle represents a global vision.',
  },

  // ---------- History ----------
  {
    keywords: ['when was asf formed', 'history', 'founded', 'founding', 'who founded'],
    answer: 'ASF UNIBEN/UBTH was formed in April 1994, started independently by Bro. Jude Edomwonyi (Anglican Students\u2019 Fellowship) and Bro. Kingsley Egwuonwu (Anglican Youth Fellowship) — both later ordained as priests in the Anglican Communion.',
  },
  {
    keywords: ['national asf', 'asf nigeria', 'primate'],
    answer: 'ASF UNIBEN/UBTH is part of the wider Anglican Students\u2019 Fellowship (ASF) Nigeria, which began nationally in 1997 under The Most Rev. J. Abiodun, Primate of Nigeria.',
  },
  {
    keywords: ['anthem', 'theme song', 'we are one family'],
    answer: 'The fellowship\u2019s anthem, "We Are One Family," was adopted in 1999.',
  },
  {
    keywords: ['milestone', 'keyboard', 'drum set'],
    answer: 'Early milestones in the fellowship\u2019s history include its first keyboard (1997) and its first drum set (1998).',
  },

  // ---------- Membership ----------
  {
    keywords: ['join', 'become a member', 'how do i register', 'membership', 'sign up', 'who can join'],
    answer: 'Membership is open to all students of UNIBEN and UBTH — you don\u2019t need to already be Anglican. Register on the site with your name, department, level, date of birth and location, and pick a ministry group. Every member joins at least one, and at most two, ministry groups.',
  },
  {
    keywords: ['not anglican', 'other denomination', 'do i need to be anglican'],
    answer: 'No — ASF welcomes students from any Christian background, not just those raised Anglican. What matters is a sincere Christian faith and willingness to grow.',
  },
  {
    keywords: ['change ministry group', 'switch group', 'leave a ministry group'],
    answer: 'You can belong to at most two ministry groups at a time. To change or add a group, speak with the Welfare Secretary or your ministry group\u2019s leader — this isn\u2019t currently a self-service option on the site.',
  },
  {
    keywords: ['is my information private', 'data privacy', 'who sees my details', 'who can see my data'],
    answer: 'Your date of birth and location are only visible to the two site admins (GS and AGS) for member records — they aren\u2019t shown publicly. The public Leadership page only shows names, positions and photos of leaders who\u2019ve consented to appear there.',
  },
  {
    keywords: ['alumni', 'graduated', 'no longer a student'],
    answer: 'ASF has an Alumni Representative role on the Central Executive Committee to keep graduated members connected to the fellowship.',
  },

  // ---------- Ministry groups (general + one per group) ----------
  {
    keywords: ['ministry group', 'ministry groups', 'what groups', 'units', 'how many ministry groups'],
    answer: 'ASF has fifteen ministry groups and units covering prayer, outreach, discipleship, music, drama, press, stewardship, children\u2019s ministry, ushering, media, decoration, transport, and care & visitation. See the Ministry Groups page for the full list.',
  },
  {
    keywords: ['intercessory', 'prayer group', 'aim ministry'],
    answer: 'The Anglican Intercessory Ministry (AIM) leads prayer and intercession for the fellowship, working with the Prayer Secretary.',
  },
  {
    keywords: ['campus and city outreach', 'outreach group', 'cco'],
    answer: 'Campus & City Outreach (CCO) handles evangelism within and outside the campus.',
  },
  {
    keywords: ['pastoral aid', 'cpam', 'discipleship unit', 'counselling unit', 'school visitation'],
    answer: 'The Church Pastoral Aid Ministry (CPAM) runs discipleship classes, counselling, school visitation, and baptism/confirmation teaching, through four internal units.',
  },
  {
    keywords: ['children ministry', 'sunday school', 'acm'],
    answer: 'The Anglican Children Ministry (ACM) evangelises to and teaches children, including primary school visits and Sunday school work.',
  },
  {
    keywords: ['music ministry', 'choir', 'instrumentalist', 'amm'],
    answer: 'The Anglican Music Ministry (AMM) is the fellowship\u2019s choir — training instrumentalists, composing songs, and ministering through music on and off campus.',
  },
  {
    keywords: ['drama ministry', 'adm', 'sketch', 'play'],
    answer: 'The Anglican Drama Ministry (ADM) ministers the gospel through drama — writing and performing plays on and off campus.',
  },
  {
    keywords: ['press ministry', 'apm', 'library', 'tract', 'literature'],
    answer: 'The Anglican Press Ministry (APM) spreads Christian literature, cares for the fellowship library, and provides a platform for members\u2019 writing.',
  },
  {
    keywords: ['stewardship ministry', 'asm', 'fundraising'],
    answer: 'The Anglican Stewardship Ministry (ASM) organises fundraising for the fellowship throughout the year.',
  },
  {
    keywords: ['ministry of helps', 'amh', 'hospital visit', 'orphanage'],
    answer: 'The Anglican Ministry of Helps (AMH) visits hospitals, orphanages and remand homes to share the gospel and provide material aid.',
  },
  {
    keywords: ['masus', 'usher', 'sidemen', 'server'],
    answer: 'The Ministry of Anglican Sidemen, Ushers & Servers (MASUS) keeps meetings running smoothly — welcoming visitors and serving as ushers.',
  },
  {
    keywords: ['publicity unit', 'press release', 'poster'],
    answer: 'The Publicity Unit handles publicity for fellowship activities — press releases, posters, and notice boards — working with the Publicity Secretary.',
  },
  {
    keywords: ['technical unit', 'media unit', 'tmu', 'sound', 'equipment'],
    answer: 'The Technical and Media Unit (TMU) maintains fellowship equipment, sets up for meetings, and covers events on media.',
  },
  {
    keywords: ['aesthetic unit', 'decoration', 'decor'],
    answer: 'The Aesthetic Unit decorates and arranges venues for fellowship activities.',
  },
  {
    keywords: ['transport unit', 'vehicle'],
    answer: 'The Transport Unit maintains fellowship vehicles and arranges transportation for activities.',
  },
  {
    keywords: ['care and visitation', 'cvu', 'welfare visit', 'sick visit'],
    answer: 'The Care and Visitation Unit (CVU) follows up with new and existing members, visits the sick, and registers new members.',
  },

  // ---------- Leadership & structure ----------
  {
    keywords: ['leader', 'exco', 'president', 'executive', 'who runs asf'],
    answer: 'You can see the full Central Executive Committee (EXCO) and ministry group leaders, with photos as they come in, on the Leadership page.',
  },
  {
    keywords: ['hall rep', 'hall representative', 'male hall', 'female hall'],
    answer: 'ASF has Male and Female Hall Representatives who coordinate members within their respective halls of residence.',
  },
  {
    keywords: ['bdpa', 'ekosodin', 'ubth coordinator', 'ekhuewan', 'satellite'],
    answer: 'Beyond the main campus, ASF has coordinators for BDPA, Ekosodin, UBTH and Ekhuewan — students in those areas have a dedicated point of contact. See the Leadership page for who\u2019s currently serving.',
  },
  {
    keywords: ['chaplain'],
    answer: 'The fellowship has a Chaplain appointed by the Diocese who guides the fellowship spiritually and links it with the Diocese, for a renewable four-year term.',
  },
  {
    keywords: ['how do i become a leader', 'run for position', 'election', 'nomination'],
    answer: 'Leadership positions go through a nomination and election process at the appropriate time in the fellowship calendar. Completing the Discipleship Study Series (DSS) is a requirement for eligibility. Speak with the current GS/AGS for specifics on timing.',
  },

  // ---------- Meetings & activities ----------
  {
    keywords: ['meeting', 'when do you meet', 'service time', 'fellowship meeting'],
    answer: 'The fellowship meets on days set by the Executive Committee (never Sundays). Ministry groups meet on days agreed by their own members. Check the Announcements board for this semester\u2019s schedule.',
  },
  {
    keywords: ['dss', 'discipleship study series'],
    answer: 'The Discipleship Study Series (DSS) is a foundational study track members complete — it\u2019s also a requirement for anyone standing for a leadership position.',
  },
  {
    keywords: ['asf sunday', 'gift day', 'music nite', 'annual fellowship meeting', 'afm', 'catch them young'],
    answer: 'ASF holds recurring events through the year including AFM (Annual Fellowship Meeting), Catch Them Young, ASF Sunday, Gift Day and Music Nite. Watch the Announcements page for dates.',
  },

  // ---------- Giving ----------
  {
    keywords: ['give', 'donate', 'offering', 'tithe', 'fund', 'money'],
    answer: 'ASF is supported by members\u2019 tithes and offerings, ASF Sunday collections, goodwill donations, and ministry group fundraising (like the Anglican Stewardship Ministry). Speak to the Financial Secretary for details.',
  },

  // ---------- Contact / admin ----------
  {
    keywords: ['contact', 'reach', 'ags', 'general secretary', 'admin', 'gs'],
    answer: "You can reach the GS on WhatsApp at +234 915 923 4422, or the AGS at +234 808 473 4611. Both numbers and the fellowship WhatsApp group link are on the Leadership page.",
  },
  {
    keywords: ['whatsapp', 'group link', 'whatsapp group', 'community', 'chat group'],
    answer: "Yes — ASF has a fellowship WhatsApp group where day-to-day updates and community happen. You'll find the join link on the Leadership page.",
  },
  {
    keywords: ['announcement', 'notice', 'where do i see updates'],
    answer: 'Official notices from the GS/AGS are posted on the Announcements page — check there for the latest updates once you\u2019re signed in.',
  },

  // ---------- Site / technical ----------
  {
    keywords: ['forgot password', 'reset password', 'lost password', 'cant sign in', "can't log in"],
    answer: 'There isn\u2019t a self-service password reset on the site yet — reach out to the GS or AGS directly and they can help sort out your account access from the Supabase admin side.',
  },
  {
    keywords: ['edit my profile', 'update my details', 'change my department', 'wrong information'],
    answer: 'Profile edits aren\u2019t self-service yet either — let the GS or AGS know what needs correcting and they can update it for you.',
  },
  {
    keywords: ['is this site official', 'is this real', 'is this legit'],
    answer: 'Yes — this site is run by the ASF UNIBEN/UBTH executive, with the GS and AGS as admins.',
  },
];

const FAQ_FALLBACK = "I don't have an answer for that yet. Try asking about membership, a specific ministry group, meeting times, leadership, or giving — or reach out to the General Secretary / Assistant General Secretary directly.";
