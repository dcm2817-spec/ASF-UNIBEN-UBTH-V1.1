// Central Executive Committee (EXCO)
const WHATSAPP_GROUP_LINK = 'https://chat.whatsapp.com/I12i7ANx91WJ88O34i9ZsK?s=cl&p=a&ilr=4';

const EXCO = [
  { position: 'President', name: 'Adeniji Emmanuel', photo: 'leader-president.jpg' },
  { position: 'Vice President 1 (Ekehuan)', name: 'Aiwekhoe Sarah', photo: 'leader-vp1.jpg' },
  { position: 'Vice President 2 (Ugbowo)', name: 'Sotu Azonta Oghenevovwero', photo: 'leader-vp2.jpg',
    bio: {
      department: 'Science Laboratory Technology',
      level: '200',
      roleDescription: 'Responsible for coordinating ministry groups and ensuring orderliness during services and fellowship activities.',
      personal: 'A writer, advocate for sustainable development goals, and a lover of Christian literature, with a passion for meaningful expression and impact.',
      skills: ['Writing', 'Public Speaking'],
      scripture: 'Being confident of this, that He who began a good work in you will carry it on to completion until the day of Christ Jesus.',
      scriptureRef: 'Philippians 1:6',
    } },
  { position: 'General Secretary', name: 'Oghenevwogaga Blessing', photo: '', phone: '+2349159234422' },
  { position: 'Assistant General Secretary', name: 'Marvellous Oghenerukome Udoko', photo: 'leader-ags.png', phone: '+2348084734611',
    bio: {
      department: 'Geomatics Engineering',
      level: '200',
      roleDescription: 'Supporting the General Secretary in all secretarial duties and coordinating activities within the Secretariat to ensure effective administration.',
      personal: 'A curious and fast-learning individual with a strong passion for technology and systems, focused on solving real problems and building tools that improve how organizations function.',
      skills: ['Web Development', 'System Design & Problem Solving'],
      scripture: 'But God demonstrates His own love for us in this: While we were still sinners, Christ died for us.',
      scriptureRef: 'Romans 5:8',
    } },
  { position: 'Treasurer', name: 'Ogueghide Blessed', photo: '' },
  { position: 'Financial Secretary', name: 'Uwosu Chika', photo: '' },
  { position: 'Prayer Secretary', name: 'Yobai Hope', photo: 'leader-prayer-secretary.jpg' },
  { position: 'Bible Study Secretary', name: 'Ohioma Peace', photo: 'leader-bible-study-secretary.jpg' },
  { position: 'Evangelism Secretary', name: 'Okorodudu Miracle', photo: '' },
  { position: 'Organizing and Transport Secretary', name: 'Obie God\u2019swill Ajokpaoghene', photo: 'leader-organizing-secretary.jpg',
    bio: {
      department: 'Actuarial Science',
      level: '200',
      roleDescription: 'Focused on coordinating key ministry units (T.M.U, MASUS, T.U, Aesthetics) and ensuring that all fellowship services run smoothly and in an orderly manner.',
      personal: 'An individual with a strong interest in media and technical operations, particularly in video equipment and production. He enjoys reading, playing football, and video editing, and is passionate about contributing to the smooth running of fellowship activities.',
      skills: ['Video Editing', 'Generator Repairs'],
      scripture: 'For God so loved the world that He gave His one and only Son, that whoever believes in Him shall not perish but have eternal life.',
      scriptureRef: 'John 3:16',
    } },
  { position: 'Publicity Secretary', name: 'Okhimamhe Aleobe Harrison', photo: 'leader-publicity-secretary.jpg',
    bio: {
      department: 'Agricultural Economics and Extension Services',
      level: '200',
      roleDescription: 'Responsible for publicizing fellowship activities and managing visual communication through media and design.',
      personal: 'A passionate and devoted Christian with a strong desire for service and growth in God\u2019s presence. He expresses himself creatively through media and also enjoys singing and playing football. He remains committed to contributing meaningfully to the fellowship.',
      skills: ['Photography', 'Graphic Design'],
      scripture: 'I can do all things through Christ who strengthens me.',
      scriptureRef: 'Philippians 4:13',
    } },
  { position: 'Academic Secretary', name: 'Boluwatifie Olabuje', photo: 'leader-academic-secretary.jpg' },
  { position: 'Welfare Secretary — Brothers Coordinator', name: 'Onuvugbakpor Efeoghene', photo: '' },
  { position: 'Welfare Secretary — Sisters Coordinator', name: 'Nweze Anita', photo: '' },
  { position: 'Alumni Representative', name: 'Dania Justina', photo: '' },
];

// Ministry group & unit leaders
const MINISTRY_LEADERS = [
  { group: 'Anglican Intercessory Ministry', lead: 'Eyovwerhuvwu Priscilla', leadPhoto: '', asst: 'Obiekezie Daniel', asstPhoto: '' },
  { group: 'Campus & City Outreach', lead: 'Ogbeifun Clever', leadPhoto: '', asst: '', asstPhoto: '' },
  { group: 'Church Pastoral Aid Ministry', lead: 'Adumanti Oluwabusayo', leadPhoto: '', asst: '', asstPhoto: '' },
  { group: 'Anglican Music Ministry', lead: 'Izunwanne Destiny', leadPhoto: '', asst: 'Oluru Tejiri', asstPhoto: '' },
  { group: 'Anglican Drama Ministry', lead: 'Olanrewaju Grace', leadPhoto: '', asst: 'Abo Eucharia', asstPhoto: '' },
  { group: 'Anglican Press Ministry', lead: 'Omabuwa Godspromise', leadPhoto: 'leader-press-leader.jpg', asst: '', asstPhoto: '' },
  { group: 'Anglican Stewardship Ministry', lead: 'Fred Emmanuel', leadPhoto: 'leader-stewardship-leader.jpg', asst: '', asstPhoto: '' },
  { group: 'Anglican Ministry of Helps', lead: 'Nwugu Joy', leadPhoto: '', asst: '', asstPhoto: '' },
  { group: 'Anglican Children Ministry', lead: 'Emenieke Chisomaga', leadPhoto: 'leader-acm-leader.jpg', asst: 'Aliekw Emeka', asstPhoto: 'leader-asst-acm-leader.jpg' },
  { group: 'Ministry of Anglican Sidemen, Ushers & Servers', lead: 'Onaghise Violet', leadPhoto: 'leader-asst-masus-leader.jpg', asst: 'Olulu Angel', asstPhoto: '' },
  { group: 'Technical and Media Unit', lead: 'Udechukidu Micheal', leadPhoto: '', asst: 'Chukwobe Samson', asstPhoto: '' },
  { group: 'Transport Unit', lead: 'Ogundimu Daniel', leadPhoto: '', asst: '', asstPhoto: '' },
  { group: 'Aesthetic Unit', lead: 'Akpobasa Valentina', leadPhoto: 'leader-aesthetic-leader.jpg', asst: 'Ogheneehwosa Choice', asstPhoto: '' },
  { group: 'Publicity Unit', lead: 'Ikupa Ovie', leadPhoto: '', asst: '', asstPhoto: '' },
  { group: 'Care and Visitation Unit', lead: 'Monah Grace', leadPhoto: 'leader-cvu-leader.jpg', asst: 'Ogbemudia Eseosa', asstPhoto: 'leader-asst-cvu.jpg' },
];

// Hall / campus / satellite coordinators
const COORDINATORS = [
  { role: 'Male Hall Representative', lead: 'Dako Marvellous', leadPhoto: '', asst: 'Divine', asstPhoto: '' },
  { role: 'Female Hall Representative', lead: 'Laba Dorcas', leadPhoto: 'leader-hall-rep-female.jpg', asst: 'Deborah', asstPhoto: '' },
  { role: 'BDPA Coordinator', lead: 'Ebelo Goodness', leadPhoto: '', asst: 'Legacy', asstPhoto: '' },
  { role: 'Ekosodin Coordinator', lead: 'Chidubem Igwe', leadPhoto: '', asst: 'Emmanuel Ogheneyole', asstPhoto: '' },
  { role: 'UBTH Coordinator', lead: 'Oluru Oghenerukevwe', leadPhoto: '', asst: '', asstPhoto: '' },
  { role: 'Ekhuewan Coordinator', lead: 'Thankgod Omuzuapo', leadPhoto: '', asst: '', asstPhoto: '' },
];
