// Mock data for Smart Group Chat & AI Shift Handover (PRD §4.1).
// Same worked example as the pitch diagram: Mya (Shift A, Myanmar) leaves a voice
// note about the loose Press-02 guard bolt; Noy (Shift B, Lao) reads the AI summary.
// Demo translations: have native speakers check MY / KM / LO before the pitch.
import type { ChatKind, Lang, PhotoKey, Translated } from '../types';

/** Build a Translated record: en, th, ja, my, km, lo. */
export const L = (en: string, th: string, ja: string, my: string, km: string, lo: string): Translated => ({ en, th, ja, my, km, lo });

/** Same text in every language (free-typed text the mock translator doesn't know). */
export const same = (text: string): Translated => ({ en: text, th: text, ja: text, my: text, km: text, lo: text });

export const SHIFTS = ['A', 'B', 'C'] as const;
export const nextShift = (s: string) => SHIFTS[(SHIFTS.indexOf(s as (typeof SHIFTS)[number]) + 1) % SHIFTS.length];

/** Routine checklist per shift (Line 2). */
export const CHECKLISTS: Record<string, { id: string; label: Translated }[]> = {
  A: [
    {
      id: 'a1',
      label: L('Clean coolant filter, Machine 01', 'ล้างไส้กรองน้ำหล่อเย็น เครื่อง 01', '機械01 クーラントフィルター清掃', 'စက် 01 အအေးခံဆီ စစ်ထုတ်ကိရိယာ သန့်ရှင်းရေး', 'សម្អាតតម្រងទឹកត្រជាក់ ម៉ាស៊ីន 01', 'ລ້າງໄສ້ກອງນ້ຳຫຼໍ່ເຢັນ ເຄື່ອງ 01'),
    },
    {
      id: 'a2',
      label: L('Refill grease, Press-02', 'เติมจาระบี Press-02', 'Press-02 グリス補充', 'Press-02 ချောဆီ ဖြည့်ရန်', 'បន្ថែមខាញ់ Press-02', 'ເຕີມນ້ຳມັນຈາລະບີ Press-02'),
    },
    {
      id: 'a3',
      label: L('Check guard bolts, Press-02', 'ตรวจน็อตฝาครอบ Press-02', 'Press-02 ガードボルト点検', 'Press-02 အကာ မူလီများ စစ်ဆေးရန်', 'ពិនិត្យប៊ូឡុងគម្រប Press-02', 'ກວດນັອດຝາປິດ Press-02'),
    },
    {
      id: 'a4',
      label: L('5S sweep around Line 2', 'ทำ 5ส รอบไลน์ 2', 'ライン2周辺の5S清掃', 'လိုင်း 2 ပတ်ဝန်းကျင် 5S သန့်ရှင်းရေး', 'អនុវត្ត 5S ជុំវិញខ្សែ 2', 'ເຮັດ 5ສ ອ້ອມໄລນ໌ 2'),
    },
  ],
  B: [
    {
      id: 'b1',
      label: L('Check coolant level, Machine 01', 'ตรวจระดับน้ำหล่อเย็น เครื่อง 01', '機械01 クーラント量点検', 'စက် 01 အအေးခံဆီ အဆင့် စစ်ဆေးရန်', 'ពិនិត្យកម្រិតទឹកត្រជាក់ ម៉ាស៊ីន 01', 'ກວດລະດັບນ້ຳຫຼໍ່ເຢັນ ເຄື່ອງ 01'),
    },
    {
      id: 'b2',
      label: L('Tighten guard bolts to spec, Press-02', 'ขันน็อตฝาครอบตามสเปก Press-02', 'Press-02 ガードボルトを規定トルクで締付', 'Press-02 အကာ မူလီများကို သတ်မှတ်ချက်အတိုင်း ကျပ်ရန်', 'រឹតប៊ូឡុងគម្របតាមស្តង់ដារ Press-02', 'ຂັນນັອດຝາປິດຕາມສະເປັກ Press-02'),
    },
    {
      id: 'b3',
      label: L('Clean nozzle, Machine 03', 'ทำความสะอาดหัวฉีด เครื่อง 03', '機械03 ノズル清掃', 'စက် 03 နော်ဇယ် သန့်ရှင်းရေး', 'សម្អាតក្បាលបាញ់ ម៉ាស៊ីន 03', 'ທຳຄວາມສະອາດຫົວສີດ ເຄື່ອງ 03'),
    },
    {
      id: 'b4',
      label: L('Fill in the production log', 'กรอกบันทึกการผลิต', '生産日報を記入', 'ထုတ်လုပ်မှု မှတ်တမ်း ဖြည့်ရန်', 'បំពេញកំណត់ត្រាផលិតកម្ម', 'ຂຽນບັນທຶກການຜະລິດ'),
    },
  ],
};
CHECKLISTS.C = CHECKLISTS.B;

export interface ChatPreset {
  id: string;
  kind: ChatKind;
  text: Translated;
  /** Short line used in the AI summary's "Watch out" list. */
  watch?: Translated;
  durationSec?: number;
  fileName?: string;
  photo?: PhotoKey;
}

/** Quick notes the phone (or web) can send. Voice/photo/file buttons send the matching preset. */
export const CHAT_PRESETS: ChatPreset[] = [
  {
    id: 'q-coolant',
    kind: 'text',
    text: L('Coolant topped up on Machine 01.', 'เติมน้ำหล่อเย็นเครื่อง 01 แล้ว', '機械01のクーラントを補充しました。', 'စက် 01 တွင် အအေးခံဆီ ဖြည့်ပြီးပါပြီ။', 'បានបន្ថែមទឹកត្រជាក់ម៉ាស៊ីន 01 រួចហើយ។', 'ເຕີມນ້ຳຫຼໍ່ເຢັນເຄື່ອງ 01 ແລ້ວ.'),
  },
  {
    id: 'q-ontime',
    kind: 'text',
    text: L('Line 2 output on target today.', 'วันนี้ไลน์ 2 ผลิตได้ตามเป้า', '本日ライン2の生産は目標達成です。', 'ယနေ့ လိုင်း 2 ထုတ်လုပ်မှု ပစ်မှတ်ပြည့်ပါသည်။', 'ថ្ងៃនេះខ្សែ 2 ផលិតបានតាមគោលដៅ។', 'ມື້ນີ້ໄລນ໌ 2 ຜະລິດໄດ້ຕາມເປົ້າ.'),
  },
  {
    id: 'v-noise',
    kind: 'voice',
    durationSec: 12,
    text: L(
      'Machine 03 squeaks at start-up, then it stops after about 5 minutes.',
      'เครื่อง 03 มีเสียงเอี๊ยดตอนเปิดเครื่อง ประมาณ 5 นาทีก็หายไป',
      '機械03は起動時にキーキー音がしますが、5分ほどで止まります。',
      'စက် 03 စဖွင့်ချိန် တကျွီကျွီမြည်ပြီး ၅ မိနစ်ခန့်အကြာ ပျောက်သွားသည်။',
      'ម៉ាស៊ីន 03 មានសំឡេងគ្រីតៗពេលបើក ប្រហែល 5 នាទីក៏បាត់។',
      'ເຄື່ອງ 03 ມີສຽງອີ້ດໆຕອນເປີດເຄື່ອງ ປະມານ 5 ນາທີກໍຫາຍ.',
    ),
    watch: L('Machine 03 squeaks at start-up', 'เครื่อง 03 มีเสียงเอี๊ยดตอนเปิดเครื่อง', '機械03 起動時に異音', 'စက် 03 စဖွင့်ချိန် အသံထွက်သည်', 'ម៉ាស៊ីន 03 មានសំឡេងពេលបើក', 'ເຄື່ອງ 03 ມີສຽງຕອນເປີດ'),
  },
  {
    id: 'p-sensor',
    kind: 'photo',
    photo: 'sensor',
    text: L('Robot arm sensor cover is cracked, see photo.', 'ฝาครอบเซนเซอร์แขนกลแตก ดูรูป', 'ロボットアームのセンサーカバーが割れています。写真参照。', 'စက်လက်တံ အာရုံခံကိရိယာ အဖုံး ကွဲနေသည်၊ ဓာတ်ပုံကြည့်ပါ။', 'គម្របសេនស័រដៃរ៉ូបូតប្រេះ មើលរូបថត។', 'ຝາປິດເຊັນເຊີແຂນກົນແຕກ ເບິ່ງຮູບ.'),
    watch: L('Robot arm sensor cover cracked (photo)', 'ฝาครอบเซนเซอร์แขนกลแตก (มีรูป)', 'ロボットアームのセンサーカバー破損（写真あり）', 'စက်လက်တံ အာရုံခံ အဖုံးကွဲ (ဓာတ်ပုံ)', 'គម្របសេនស័រដៃរ៉ូបូតប្រេះ (រូបថត)', 'ຝາປິດເຊັນເຊີແຂນກົນແຕກ (ມີຮູບ)'),
  },
  {
    id: 'f-spec',
    kind: 'file',
    fileName: 'Press-02_guard_torque_spec.pdf',
    text: L('Torque spec for the Press-02 guard bolts: 25 N·m.', 'สเปกแรงขันน็อตฝาครอบ Press-02: 25 N·m', 'Press-02 ガードボルトの締付トルク：25 N·m', 'Press-02 အကာ မူလီ ကျပ်အား သတ်မှတ်ချက်: 25 N·m', 'កម្លាំងរឹតប៊ូឡុងគម្រប Press-02: 25 N·m', 'ແຮງຂັນນັອດຝາປິດ Press-02: 25 N·m'),
  },
];

/** Mya's voice note: the diagram's worked example. Also seeded into the chat. */
export const BOLT_NOTE: ChatPreset = {
  id: 'v-bolt',
  kind: 'voice',
  durationSec: 18,
  photo: 'bolt',
  text: L(
    'The Press-02 guard bolt feels loose. I only tightened it by hand.',
    'น็อตฝาครอบ Press-02 รู้สึกหลวม ขันด้วยมือไว้ก่อน',
    'Press-02のガードボルトが緩い感じです。手で締めただけです。',
    'Press-02 အကာ မူလီ ချောင်နေသလို ခံစားရသည်။ လက်ဖြင့်သာ ကျပ်ထားပါသည်။',
    'ប៊ូឡុងគម្រប Press-02 ដូចជារលុង។ ខ្ញុំគ្រាន់តែរឹតដោយដៃ។',
    'ນັອດຝາປິດ Press-02 ຮູ້ສຶກວ່າຫຼວມ. ຂັນດ້ວຍມືໄວ້ກ່ອນ.',
  ),
  watch: L(
    'Press-02 guard bolt is loose, hand-tightened only (Mya’s voice note + photo)',
    'น็อตฝาครอบ Press-02 หลวม ขันมือไว้เท่านั้น (ข้อความเสียง + รูปจาก Mya)',
    'Press-02 ガードボルトが緩い。手締めのみ（Myaの音声メモ＋写真）',
    'Press-02 အကာ မူလီ ချောင်နေ၊ လက်ဖြင့်သာ ကျပ်ထား (Mya ၏ အသံမှတ်စု + ဓာတ်ပုံ)',
    'ប៊ូឡុងគម្រប Press-02 រលុង រឹតដោយដៃប៉ុណ្ណោះ (សារសំឡេង + រូបថតពី Mya)',
    'ນັອດຝາປິດ Press-02 ຫຼວມ ຂັນດ້ວຍມືເທົ່ານັ້ນ (ຂໍ້ຄວາມສຽງ + ຮູບຈາກ Mya)',
  ),
};

/** Chat history from Shift A when the demo starts. */
export const SEED_CHAT: { authorId: string; lang: Lang; minsAgo: number; preset: ChatPreset; watchOut?: boolean }[] = [
  {
    authorId: 'op-1',
    lang: 'my',
    minsAgo: 95,
    preset: {
      id: 's1',
      kind: 'text',
      text: L('Coolant filter on Machine 01 cleaned.', 'ล้างไส้กรองน้ำหล่อเย็นเครื่อง 01 แล้ว', '機械01のクーラントフィルターを清掃しました。', 'စက် 01 ၏ အအေးခံဆီ စစ်ထုတ်ကိရိယာကို သန့်ရှင်းပြီးပါပြီ။', 'បានសម្អាតតម្រងទឹកត្រជាក់ម៉ាស៊ីន 01 រួចហើយ។', 'ລ້າງໄສ້ກອງນ້ຳຫຼໍ່ເຢັນເຄື່ອງ 01 ແລ້ວ.'),
    },
  },
  {
    authorId: 'op-2',
    lang: 'km',
    minsAgo: 70,
    preset: {
      id: 's2',
      kind: 'photo',
      photo: 'coolant',
      text: L('Grease refilled on Press-02.', 'เติมจาระบี Press-02 แล้ว', 'Press-02にグリスを補充しました。', 'Press-02 တွင် ချောဆီ ဖြည့်ပြီးပါပြီ။', 'បានបន្ថែមខាញ់ Press-02 រួចហើយ។', 'ເຕີມຈາລະບີ Press-02 ແລ້ວ.'),
    },
  },
  {
    authorId: 'eng-1',
    lang: 'ja',
    minsAgo: 40,
    preset: {
      id: 's3',
      kind: 'text',
      text: L(
        'Please post anything unusual before 14:00 so the AI summary includes it.',
        'มีอะไรผิดปกติให้โพสต์ก่อน 14:00 เพื่อให้ AI สรุปไว้ด้วย',
        '異常があれば14:00までに投稿してください。AI要約に入ります。',
        'ပုံမှန်မဟုတ်သည်များကို AI အနှစ်ချုပ်တွင် ပါဝင်စေရန် 14:00 မတိုင်မီ တင်ပါ။',
        'សូមបង្ហោះអ្វីដែលមិនប្រក្រតីមុនម៉ោង 14:00 ដើម្បីឲ្យ AI សង្ខេបបញ្ចូល។',
        'ມີຫຍັງຜິດປົກກະຕິໃຫ້ໂພສກ່ອນ 14:00 ເພື່ອໃຫ້ AI ສະຫຼຸບນຳ.',
      ),
    },
  },
  { authorId: 'op-1', lang: 'my', minsAgo: 12, preset: BOLT_NOTE, watchOut: true },
];

/** Lines the AI adds to the summary for repair jobs. Params: {machine} {title}. */
export const SUMMARY_LINES = {
  fixed: L('Fixed: {machine}, {title}', 'ซ่อมเสร็จ: {machine} {title}', '修理完了：{machine}・{title}', 'ပြင်ပြီး: {machine}၊ {title}', 'បានជួសជុល: {machine} {title}', 'ສ້ອມແລ້ວ: {machine} {title}'),
  open: L('Open repair: {machine}, {title}', 'งานซ่อมค้าง: {machine} {title}', '未完了の修理：{machine}・{title}', 'မပြီးသေးသော ပြင်ဆင်မှု: {machine}၊ {title}', 'ការជួសជុលមិនទាន់រួច: {machine} {title}', 'ວຽກສ້ອມຄ້າງ: {machine} {title}'),
};

export const PHOTO_CAPTION: Record<PhotoKey, Translated> = {
  coolant: L('Photo: Press-02 grease nipple', 'รูป: หัวอัดจาระบี Press-02', '写真：Press-02 グリースニップル', 'ဓာတ်ပုံ: Press-02 ချောဆီပေါက်', 'រូបថត: ក្បាលចាក់ខាញ់ Press-02', 'ຮູບ: ຫົວອັດຈາລະບີ Press-02'),
  bolt: L('Photo: Press-02 guard bolt', 'รูป: น็อตฝาครอบ Press-02', '写真：Press-02 ガードボルト', 'ဓာတ်ပုံ: Press-02 အကာ မူလီ', 'រូបថត: ប៊ូឡុងគម្រប Press-02', 'ຮູບ: ນັອດຝາປິດ Press-02'),
  sensor: L('Photo: robot arm sensor cover', 'รูป: ฝาครอบเซนเซอร์แขนกล', '写真：ロボットアームのセンサーカバー', 'ဓာတ်ပုံ: စက်လက်တံ အာရုံခံ အဖုံး', 'រូបថត: គម្របសេនស័រដៃរ៉ូបូត', 'ຮູບ: ຝາປິດເຊັນເຊີແຂນກົນ'),
};

/** System line posted in the chat when a shift ends. Params: {from} {to}. */
export const SHIFT_ENDED = L(
  'Shift {from} ended. AI summary pinned for Shift {to}.',
  'จบกะ {from} แล้ว AI ปักหมุดสรุปงานให้กะ {to}',
  'シフト{from}終了。シフト{to}向けにAI要約を固定しました。',
  'အဆိုင်း {from} ပြီးဆုံးပါပြီ။ အဆိုင်း {to} အတွက် AI အနှစ်ချုပ်ကို ပင်ထိုးထားသည်။',
  'វេន {from} បានបញ្ចប់។ AI បានខ្ទាស់សេចក្តីសង្ខេបសម្រាប់វេន {to}។',
  'ກະ {from} ຈົບແລ້ວ. AI ປັກໝຸດສະຫຼຸບໃຫ້ກະ {to}.',
);
