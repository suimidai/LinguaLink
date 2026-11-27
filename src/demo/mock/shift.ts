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
    { id: 'a5', label: L('Check hydraulic oil level, Press-02', 'ตรวจระดับน้ำมันไฮดรอลิก Press-02', 'Press-02 作動油量点検', 'Press-02 ဟိုက်ဒရောလစ်ဆီ အဆင့် စစ်ဆေးရန်', 'ពិនិត្យកម្រិតប្រេងធារាសាស្ត្រ Press-02', 'ກວດລະດັບນ້ຳມັນໄຮໂດຼລິກ Press-02') },
    { id: 'a6', label: L('Wipe down robot gripper, Machine 04', 'เช็ดทำความสะอาดมือจับหุ่นยนต์ เครื่อง 04', '機械04 ロボットグリッパー清掃', 'စက် 04 ရိုဘော့ ဖမ်းကိရိယာ သုတ်သင်ရန်', 'ជូតសម្អាតដៃចាប់រ៉ូបូត ម៉ាស៊ីន 04', 'ເຊັດທຳຄວາມສະອາດມືຈັບຫຸ່ນຍົນ ເຄື່ອງ 04') },
    { id: 'a7', label: L('Check air pressure is 6 bar, Line 2', 'ตรวจแรงดันลมให้ได้ 6 บาร์ ไลน์ 2', 'ライン2 エア圧6barを確認', 'လိုင်း 2 လေဖိအား 6 bar ဖြစ်ကြောင်း စစ်ဆေးရန်', 'ពិនិត្យសម្ពាធខ្យល់ 6 bar ខ្សែ 2', 'ກວດຄວາມດັນລົມໃຫ້ໄດ້ 6 ບາ ໄລນ໌ 2') },
    { id: 'a8', label: L('Empty chip bin, Machine 01', 'เทถังเศษโลหะ เครื่อง 01', '機械01 切粉ボックスを空にする', 'စက် 01 သတ္တုအမှိုက်ပုံး ရှင်းရန်', 'ចាក់ចោលធុងកំទេចដែក ម៉ាស៊ីន 01', 'ເທຖັງເສດໂລຫະ ເຄື່ອງ 01') },
    { id: 'a9', label: L('Measure first-piece sample, Machine 01', 'วัดชิ้นงานตัวอย่างชิ้นแรก เครื่อง 01', '機械01 初品を測定', 'စက် 01 ပထမဆုံး နမူနာအပိုင်း တိုင်းတာရန်', 'វាស់គំរូផលិតផលដំបូង ម៉ាស៊ីន 01', 'ວັດແທກຊິ້ນງານຕົວຢ່າງທຳອິດ ເຄື່ອງ 01') },
    { id: 'a10', label: L('Test emergency stop buttons, Line 2', 'ทดสอบปุ่มหยุดฉุกเฉิน ไลน์ 2', 'ライン2 非常停止ボタンを点検', 'လိုင်း 2 အရေးပေါ်ရပ်ခလုတ်များ စမ်းသပ်ရန်', 'សាកល្បងប៊ូតុងបញ្ឈប់បន្ទាន់ ខ្សែ 2', 'ທົດສອບປຸ່ມຢຸດສຸກເສີນ ໄລນ໌ 2') },
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
    { id: 'b5', label: L('Check mould temperature, Machine 03', 'ตรวจอุณหภูมิแม่พิมพ์ เครื่อง 03', '機械03 金型温度を確認', 'စက် 03 ပုံစံခွက် အပူချိန် စစ်ဆေးရန်', 'ពិនិត្យសីតុណ្ហភាពពុម្ព ម៉ាស៊ីន 03', 'ກວດອຸນຫະພູມແມ່ພິມ ເຄື່ອງ 03') },
    { id: 'b6', label: L('Refill coolant tank, Machine 01', 'เติมถังน้ำหล่อเย็น เครื่อง 01', '機械01 クーラントタンク補充', 'စက် 01 အအေးခံဆီ တိုင်ကီ ဖြည့်ရန်', 'បំពេញធុងទឹកត្រជាក់ ម៉ាស៊ីន 01', 'ເຕີມຖັງນ້ຳຫຼໍ່ເຢັນ ເຄື່ອງ 01') },
    { id: 'b7', label: L('Test light curtain, Press-02', 'ทดสอบม่านแสงนิรภัย Press-02', 'Press-02 ライトカーテンを点検', 'Press-02 အလင်းကန့်လန့်ကာ စမ်းသပ်ရန်', 'សាកល្បងវាំងនភ្លើងសុវត្ថិភាព Press-02', 'ທົດສອບມ່ານແສງນິລະໄພ Press-02') },
    { id: 'b8', label: L('Clean robot cell floor, Machine 04', 'ทำความสะอาดพื้นห้องหุ่นยนต์ เครื่อง 04', '機械04 ロボットセル床清掃', 'စက် 04 ရိုဘော့အခန်း ကြမ်းပြင် သန့်ရှင်းရေး', 'សម្អាតកម្រាលបន្ទប់រ៉ូបូត ម៉ាស៊ីន 04', 'ທຳຄວາມສະອາດພື້ນຫ້ອງຫຸ່ນຍົນ ເຄື່ອງ 04') },
    { id: 'b9', label: L('Count and log scrap parts', 'นับและบันทึกชิ้นงานเสีย', '不良品を数えて記録', 'ပျက်စီးသောအပိုင်းများ ရေတွက်၍ မှတ်တမ်းတင်ရန်', 'រាប់ និងកត់ត្រាគ្រឿងខូច', 'ນັບ ແລະ ບັນທຶກຊິ້ນງານເສຍ') },
    { id: 'b10', label: L('Check fire extinguisher tags, Line 2', 'ตรวจป้ายถังดับเพลิง ไลน์ 2', 'ライン2 消火器の点検票を確認', 'လိုင်း 2 မီးသတ်ဆေးဘူး တံဆိပ်များ စစ်ဆေးရန်', 'ពិនិត្យស្លាកឧបករណ៍ពន្លត់អគ្គិភ័យ ខ្សែ 2', 'ກວດປ້າຍຖັງດັບເພີງ ໄລນ໌ 2') },
  ],
};
CHECKLISTS.C = [
    { id: 'c1', label: L('Check coolant level, Machine 01', 'ตรวจระดับน้ำหล่อเย็น เครื่อง 01', '機械01 クーラント量点検', 'စက် 01 အအေးခံဆီ အဆင့် စစ်ဆေးရန်', 'ពិនិត្យកម្រិតទឹកត្រជាក់ ម៉ាស៊ីន 01', 'ກວດລະດັບນ້ຳຫຼໍ່ເຢັນ ເຄື່ອງ 01') },
    { id: 'c2', label: L('Grease slide rails, Press-02', 'อัดจาระบีรางเลื่อน Press-02', 'Press-02 スライドレールに給脂', 'Press-02 လျှောရထားလမ်း ချောဆီထည့်ရန်', 'ដាក់ខាញ់ផ្លូវរអិល Press-02', 'ອັດນ້ຳມັນຈາລະບີຮາງເລື່ອນ Press-02') },
    { id: 'c3', label: L('Purge the barrel, Machine 03', 'ไล่พลาสติกในกระบอกฉีด เครื่อง 03', '機械03 シリンダーをパージ', 'စက် 03 ပိုက်ထဲမှ ပလတ်စတစ် ရှင်းထုတ်ရန်', 'បញ្ចេញប្លាស្ទិកក្នុងបំពង់ ម៉ាស៊ីន 03', 'ໄລ່ພລາສຕິກໃນກະບອກສີດ ເຄື່ອງ 03') },
    { id: 'c4', label: L('Back up robot program, Machine 04', 'สำรองโปรแกรมหุ่นยนต์ เครื่อง 04', '機械04 ロボットプログラムをバックアップ', 'စက် 04 ရိုဘော့ ပရိုဂရမ် အရန်သိမ်းရန်', 'បម្រុងទុកកម្មវិធីរ៉ូបូត ម៉ាស៊ីន 04', 'ສຳຮອງໂປຣແກຣມຫຸ່ນຍົນ ເຄື່ອງ 04') },
    { id: 'c5', label: L('Run spindle warm-up, Machine 01', 'วอร์มแกนหมุน เครื่อง 01', '機械01 主軸暖機運転', 'စက် 01 ဝင်ရိုး အပူပေးလည်ပတ်ရန်', 'កម្តៅអ័ក្សបង្វិល ម៉ាស៊ីន 01', 'ວອມແກນໝູນ ເຄື່ອງ 01') },
    { id: 'c6', label: L('Lock out Press-02 for weekly die check', 'ล็อกเอาต์ Press-02 เพื่อตรวจแม่พิมพ์ประจำสัปดาห์', '週次金型点検のためPress-02をロックアウト', 'အပတ်စဉ် ပုံစံခွက်စစ်ရန် Press-02 ကို လော့ခ်ချရန်', 'ចាក់សោ Press-02 ដើម្បីពិនិត្យពុម្ពប្រចាំសប្តាហ៍', 'ລັອກເອົາ Press-02 ເພື່ອກວດແມ່ພິມປະຈຳອາທິດ') },
    { id: 'c7', label: L('5S sweep around Line 2', 'ทำ 5ส รอบไลน์ 2', 'ライン2周辺の5S清掃', 'လိုင်း 2 ပတ်ဝန်းကျင် 5S သန့်ရှင်းရေး', 'អនុវត្ត 5S ជុំវិញខ្សែ 2', 'ເຮັດ 5ສ ອ້ອມໄລນ໌ 2') },
    { id: 'c8', label: L('Restock gloves and earplugs', 'เติมถุงมือและที่อุดหู', '手袋と耳栓を補充', 'လက်အိတ်နှင့် နားကြပ် ပြန်ဖြည့်ရန်', 'បំពេញស្រោមដៃ និងឆ្នុកត្រចៀក', 'ເຕີມຖົງມື ແລະ ທີ່ອຸດຫູ') },
    { id: 'c9', label: L('Drain the compressor tank, Line 2', 'ระบายน้ำถังคอมเพรสเซอร์ ไลน์ 2', 'ライン2 コンプレッサータンクの水抜き', 'လိုင်း 2 လေဖိစက် တိုင်ကီရေ ထုတ်ရန်', 'បង្ហូរទឹកធុងម៉ាស៊ីនបង្ហាប់ខ្យល់ ខ្សែ 2', 'ລະບາຍນ້ຳຖັງຄອມເພຣສເຊີ ໄລນ໌ 2') },
    { id: 'c10', label: L('Fill in the production log', 'กรอกบันทึกการผลิต', '生産日報を記入', 'ထုတ်လုပ်မှု မှတ်တမ်း ဖြည့်ရန်', 'បំពេញកំណត់ត្រាផលិតកម្ម', 'ຂຽນບັນທຶກການຜະລິດ') },
];

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
/** System lines the AI posts in the chat when it acts on a message. */
export const AI_NOTES = {
  taskAdded: L('AI added a task: {task}', 'AI เพิ่มงาน: {task}', 'AIがタスクを追加：{task}', 'AI က အလုပ်ထည့်သည်: {task}', 'AI បានបន្ថែមការងារ: {task}', 'AI ເພີ່ມວຽກ: {task}'),
  taskNext: L('AI added a task for the next shift: {task}', 'AI เพิ่มงานให้กะถัดไป: {task}', 'AIが次のシフトにタスクを追加：{task}', 'AI က နောက်အဆိုင်းအတွက် အလုပ်ထည့်သည်: {task}', 'AI បានបន្ថែមការងារសម្រាប់វេនបន្ទាប់: {task}', 'AI ເພີ່ມວຽກໃຫ້ກະຕໍ່ໄປ: {task}'),
  reportOpened: L('AI opened a repair report: {machine}, {title}', 'AI เปิดใบแจ้งซ่อม: {machine} {title}', 'AIが修理依頼を作成：{machine}・{title}', 'AI က ပြင်ဆင်ရန် တိုင်ကြားစာ ဖွင့်သည်: {machine}၊ {title}', 'AI បានបើករបាយការណ៍ជួសជុល: {machine} {title}', 'AI ເປີດໃບແຈ້ງສ້ອມ: {machine} {title}'),
};

export const SHIFT_ENDED = L(
  'Shift {from} ended. AI summary pinned for Shift {to}.',
  'จบกะ {from} แล้ว AI ปักหมุดสรุปงานให้กะ {to}',
  'シフト{from}終了。シフト{to}向けにAI要約を固定しました。',
  'အဆိုင်း {from} ပြီးဆုံးပါပြီ။ အဆိုင်း {to} အတွက် AI အနှစ်ချုပ်ကို ပင်ထိုးထားသည်။',
  'វេន {from} បានបញ្ចប់។ AI បានខ្ទាស់សេចក្តីសង្ខេបសម្រាប់វេន {to}។',
  'ກະ {from} ຈົບແລ້ວ. AI ປັກໝຸດສະຫຼຸບໃຫ້ກະ {to}.',
);
