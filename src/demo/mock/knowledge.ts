// Mock data for Senior Knowledge Base & AI Skill Transfer (PRD §4.2).
// Same worked example as the pitch: Press-02 stripped bolt → "▶ Prasert · 1:24".
// The "AI" is scripted: a keyword matcher picks the answer; answers are built only
// from senior tips (never made up). Demo translations: have native speakers check MY / KM / LO.
import type { KnowledgeEntry, KnowledgeFormat, Translated } from '../types';

import { L } from './shift';

type EntrySeed = Omit<KnowledgeEntry, 'addedAt' | 'readyAt'>;

export const KNOWLEDGE_SEED: EntrySeed[] = [
  {
    id: 'kb-bolt',
    seniorId: 'sen-1',
    format: 'VIDEO',
    machineId: 'm02',
    title: L('Press-02: fixing a stripped guard-bolt thread', 'Press-02: แก้เกลียวน็อตฝาครอบหวาน', 'Press-02：ガードボルトのねじ山つぶれの直し方', 'Press-02: ချောနေသော အကာ မူလီ ချောင်းကို ပြင်နည်း', 'Press-02: ជួសជុលប៊ូឡុងគម្របដែលរលួសរង្វេល', 'Press-02: ແກ້ເກືອວນັອດຝາປິດຫວານ'),
    durationSec: 190,
    segments: [
      { at: 0, text: L('Lock out the press (LOTO) before you touch the guard.', 'ล็อกเอาต์เครื่องกด (LOTO) ก่อนจับฝาครอบ', 'ガードに触る前にプレスをロックアウト（LOTO）する。', 'အကာကို မထိမီ ဖိစက်ကို LOTO ဖြင့် ပိတ်ပါ။', 'ចាក់សោម៉ាស៊ីនសង្កត់ (LOTO) មុនប៉ះគម្រប។', 'ລັອກເອົາເຄື່ອງກົດ (LOTO) ກ່ອນຈັບຝາປິດ.') },
      { at: 42, text: L('Take the bolt out. If the thread inside the hole is shiny and flat, it is stripped.', 'ถอดน็อตออก ถ้าเกลียวในรูเรียบและมันวาว แปลว่าเกลียวหวาน', 'ボルトを抜く。穴の中のねじ山が平らで光っていれば、つぶれている。', 'မူလီကို ဖြုတ်ပါ။ အပေါက်အတွင်း ချောင်းများ ချောမွတ်တောက်ပနေလျှင် ချောနေပြီ။', 'ដកប៊ូឡុងចេញ។ បើរង្វេលក្នុងរន្ធរលោងហើយភ្លឺ មានន័យថារលួស។', 'ຖອດນັອດອອກ ຖ້າເກືອວໃນຮູລຽບ ແລະ ເຫຼື້ອມ ແປວ່າເກືອວຫວານ.') },
      { at: 84, text: L('Drill the hole out and fit an M10 thread insert. Don’t just use a longer bolt.', 'เจาะรูใหม่แล้วใส่สปริงเกลียว M10 อย่าแค่เปลี่ยนน็อตยาวขึ้น', '穴をドリルで広げてM10ねじインサートを入れる。長いボルトでごまかさない。', 'အပေါက်ကို လွန်ဖြင့် ဖောက်ပြီး M10 ချောင်းအသွင်း တပ်ပါ။ မူလီရှည်ဖြင့် အစားမထိုးပါနှင့်။', 'ខួងរន្ធចេញ ហើយដាក់រង្វេលបញ្ចូល M10។ កុំគ្រាន់តែប្រើប៊ូឡុងវែងជាង។', 'ເຈາະຮູໃໝ່ ແລ້ວໃສ່ສະປິງເກືອວ M10. ຢ່າພຽງແຕ່ປ່ຽນນັອດຍາວຂຶ້ນ.') },
      { at: 135, text: L('Tighten the new bolt with a torque wrench to 25 N·m.', 'ขันน็อตใหม่ด้วยประแจทอร์กที่ 25 N·m', '新しいボルトをトルクレンチで25 N·mに締める。', 'မူလီအသစ်ကို တော့ခ်ဂွ ဖြင့် 25 N·m အထိ ကျပ်ပါ။', 'រឹតប៊ូឡុងថ្មីដោយប្រើដងគ្រាប់ទៅ 25 N·m។', 'ຂັນນັອດໃໝ່ດ້ວຍປະແຈທອກທີ່ 25 N·m.') },
      { at: 170, text: L('Shake the guard by hand. It must not move. Then remove the lock.', 'เขย่าฝาครอบด้วยมือ ต้องไม่ขยับ แล้วจึงปลดล็อก', 'ガードを手で揺すって動かないことを確認し、ロックを外す。', 'အကာကို လက်ဖြင့် လှုပ်ကြည့်ပါ။ မလှုပ်ရပါ။ ထို့နောက် သော့ဖြုတ်ပါ။', 'អង្រួនគម្របដោយដៃ វាមិនត្រូវរើទេ។ បន្ទាប់មកដោះសោ។', 'ເຂົ່າຝາປິດດ້ວຍມື ຕ້ອງບໍ່ເໜັງ ແລ້ວຈຶ່ງປົດລັອກ.') },
    ],
  },
  {
    id: 'kb-spindle',
    seniorId: 'sen-2',
    format: 'VOICE',
    machineId: 'm01',
    title: L('Spindle grinding noise: check the bearing first', 'แกนหมุนมีเสียงครูด: ตรวจแบริ่งก่อน', '主軸のゴリゴリ音：まずベアリングを確認', 'ဝင်ရိုး အသံထွက်: ဘယ်ရင်ကို အရင်စစ်ပါ', 'សំឡេងកកិតអ័ក្សបង្វិល: ពិនិត្យប៊ីរីងមុន', 'ແກນໝູນມີສຽງຄູດ: ກວດລູກປືນກ່ອນ'),
    durationSec: 125,
    segments: [
      { at: 0, text: L('Stop the spindle and let it cool for 10 minutes.', 'หยุดแกนหมุนแล้วรอให้เย็นลง 10 นาที', '主軸を止めて10分冷ます。', 'ဝင်ရိုးကို ရပ်ပြီး ၁၀ မိနစ် အေးအောင်ထားပါ။', 'បញ្ឈប់អ័ក្សបង្វិល ហើយទុកឲ្យត្រជាក់ 10 នាទី។', 'ຢຸດແກນໝູນ ແລ້ວລໍໃຫ້ເຢັນ 10 ນາທີ.') },
      { at: 35, text: L('Turn it slowly by hand. A rough, gritty feel means a worn bearing.', 'หมุนด้วยมือช้าๆ ถ้าสะดุดเหมือนมีทราย แปลว่าแบริ่งสึก', '手でゆっくり回す。ザラザラした感触ならベアリング摩耗。', 'လက်ဖြင့် ဖြည်းဖြည်းလှည့်ပါ။ ကြမ်းတမ်းလျှင် ဘယ်ရင် ပွန်းနေသည်။', 'បង្វិលដោយដៃយឺតៗ។ បើមានអារម្មណ៍រដុប មានន័យថាប៊ីរីងសឹក។', 'ໝູນດ້ວຍມືຊ້າໆ ຖ້າສະດຸດຄືມີຊາຍ ແປວ່າລູກປືນສຶກ.') },
      { at: 70, text: L('If it turns smoothly, add grease first and run it at low speed.', 'ถ้าหมุนลื่น ให้เติมจาระบีก่อนแล้วเดินรอบต่ำ', 'スムーズに回るなら、先にグリスを足して低速で回す。', 'ချောချောမွေ့မွေ့ လည်လျှင် ချောဆီ အရင်ဖြည့်ပြီး အရှိန်နိမ့်ဖြင့် လည်ပါ။', 'បើបង្វិលរលូន ចាក់ខាញ់មុន ហើយដំណើរការល្បឿនទាប។', 'ຖ້າໝູນລື່ນ ໃຫ້ເຕີມຈາລະບີກ່ອນ ແລ້ວເດີນຮອບຕ່ຳ.') },
      { at: 100, text: L('Replace the bearing with 6205-2RS. Always change both sides.', 'เปลี่ยนแบริ่งเป็น 6205-2RS เปลี่ยนทั้งสองข้างเสมอ', 'ベアリングを6205-2RSに交換。必ず両側とも替える。', 'ဘယ်ရင်ကို 6205-2RS ဖြင့် လဲပါ။ နှစ်ဖက်လုံး အမြဲလဲပါ။', 'ប្តូរប៊ីរីង 6205-2RS។ ប្តូរទាំងសងខាងជានិច្ច។', 'ປ່ຽນລູກປືນເປັນ 6205-2RS. ປ່ຽນທັງສອງຂ້າງສະເໝີ.') },
    ],
  },
  {
    id: 'kb-hot',
    seniorId: 'sen-3',
    format: 'TEXT',
    machineId: 'm03',
    title: L('Machine 03 running hot: clear the grease line', 'เครื่อง 03 ร้อน: ล้างท่อจาระบีที่ตัน', '機械03が熱い：グリスラインの詰まりを取る', 'စက် 03 ပူနေ: ချောဆီပိုက် ပိတ်ဆို့မှု ရှင်းပါ', 'ម៉ាស៊ីន 03 ក្តៅ: សម្អាតបំពង់ខាញ់', 'ເຄື່ອງ 03 ຮ້ອນ: ລ້າງທໍ່ຈາລະບີທີ່ຕັນ'),
    durationSec: 0,
    segments: [
      { at: 0, text: L('Feel the grease line near the pump. A cold section means it is blocked there.', 'จับท่อจาระบีใกล้ปั๊ม ช่วงที่เย็นคือจุดที่ตัน', 'ポンプ近くのグリスラインを触る。冷たい部分が詰まり箇所。', 'ပန့်အနီး ချောဆီပိုက်ကို စမ်းကြည့်ပါ။ အေးနေသောနေရာတွင် ပိတ်နေသည်။', 'ប៉ះបំពង់ខាញ់ជិតម៉ាស៊ីនបូម។ ផ្នែកដែលត្រជាក់គឺកន្លែងស្ទះ។', 'ຈັບທໍ່ຈາລະບີໃກ້ປ້ຳ ຊ່ວງທີ່ເຢັນຄືຈຸດທີ່ຕັນ.') },
      { at: 1, text: L('Take the line off and push warm grease through by hand pump.', 'ถอดท่อออกแล้วอัดจาระบีอุ่นด้วยปั๊มมือ', 'ラインを外し、手動ポンプで温めたグリスを押し通す。', 'ပိုက်ကို ဖြုတ်ပြီး လက်ပန့်ဖြင့် နွေးသော ချောဆီကို ထိုးသွင်းပါ။', 'ដោះបំពង់ចេញ ហើយបូមខាញ់ក្តៅដោយម៉ាស៊ីនបូមដៃ។', 'ຖອດທໍ່ອອກ ແລ້ວອັດຈາລະບີອຸ່ນດ້ວຍປ້ຳມື.') },
      { at: 2, text: L('Run 15 minutes and check the housing is below 65 °C.', 'เดินเครื่อง 15 นาที แล้วเช็กว่าตัวเครื่องต่ำกว่า 65 °C', '15分運転し、本体が65 °C以下か確認する。', '၁၅ မိနစ် လည်ပြီး ကိုယ်ထည် 65 °C အောက် ဖြစ်မဖြစ် စစ်ပါ။', 'ដំណើរការ 15 នាទី ហើយពិនិត្យថាតួម៉ាស៊ីនទាបជាង 65 °C។', 'ເດີນເຄື່ອງ 15 ນາທີ ແລ້ວກວດວ່າຕົວເຄື່ອງຕ່ຳກວ່າ 65 °C.') },
    ],
  },
];

/** Tips a senior can "upload" from the web (mock ingestion). */
export const ADD_PRESETS: (EntrySeed & { label: string })[] = [
  {
    id: 'add-robot',
    label: 'Boonmee · video · Machine 04',
    seniorId: 'sen-3',
    format: 'VIDEO',
    machineId: 'm04',
    title: L('Robot arm: re-teach the home position', 'แขนกล: สอนตำแหน่งโฮมใหม่', 'ロボットアーム：原点位置の再ティーチング', 'စက်လက်တံ: မူလနေရာကို ပြန်သင်ပေးနည်း', 'ដៃរ៉ូបូត: បង្រៀនទីតាំងដើមឡើងវិញ', 'ແຂນກົນ: ສອນຕຳແໜ່ງໂຮມໃໝ່'),
    durationSec: 150,
    segments: [
      { at: 0, text: L('Switch the pendant to teach mode and slow speed to 10 %.', 'สลับรีโมตเป็นโหมดสอน และลดความเร็วเหลือ 10 %', 'ペンダントをティーチモードにし、速度を10 %に落とす。', 'ထိန်းချုပ်ခလုတ်ကို သင်ကြားမုဒ်သို့ ပြောင်းပြီး အရှိန် 10 % သို့ လျှော့ပါ။', 'ប្តូរឧបករណ៍បញ្ជាទៅរបៀបបង្រៀន ហើយបន្ថយល្បឿន 10 %។', 'ສະຫຼັບຣີໂໝດເປັນໂໝດສອນ ແລະ ຫຼຸດຄວາມໄວເຫຼືອ 10 %.') },
      { at: 64, text: L('Line up the arm with the two yellow marks, then save as HOME.', 'จัดแขนให้ตรงกับเครื่องหมายสีเหลืองสองจุด แล้วบันทึกเป็น HOME', 'アームを黄色い印2つに合わせ、HOMEとして保存する。', 'လက်တံကို အဝါရောင် အမှတ်နှစ်ခုနှင့် ညှိပြီး HOME အဖြစ် သိမ်းပါ။', 'តម្រង់ដៃនឹងសញ្ញាពណ៌លឿងពីរ ហើយរក្សាទុកជា HOME។', 'ຈັດແຂນໃຫ້ກົງກັບເຄື່ອງໝາຍສີເຫຼືອງສອງຈຸດ ແລ້ວບັນທຶກເປັນ HOME.') },
    ],
  },
  {
    id: 'add-die',
    label: 'Prasert · voice · Press-02',
    seniorId: 'sen-1',
    format: 'VOICE',
    machineId: 'm02',
    title: L('Press-02: hear a loose die before it breaks', 'Press-02: ฟังเสียงแม่พิมพ์หลวมก่อนพัง', 'Press-02：壊れる前に金型の緩みを音で聞き分ける', 'Press-02: မကျိုးမီ ချောင်နေသော ပုံစံခွက်ကို အသံဖြင့် သိနည်း', 'Press-02: ស្តាប់សំឡេងពុម្ពរលុងមុនវាខូច', 'Press-02: ຟັງສຽງແມ່ພິມຫຼວມກ່ອນພັງ'),
    durationSec: 95,
    segments: [
      { at: 0, text: L('A double “clack” on each stroke means the die clamp is loose.', 'ถ้าได้ยินเสียง “แกร๊ก” สองครั้งทุกจังหวะ แปลว่าตัวจับแม่พิมพ์หลวม', '1ストロークごとに「カチャ」が2回鳴れば金型クランプが緩い。', 'တစ်ချက်ချင်းစီတွင် “ချက်” နှစ်ကြိမ် ကြားရလျှင် ပုံစံခွက် ညှပ်ချောင်နေသည်။', 'បើឮសំឡេង “ក្រឹក” ពីរដងរាល់ចង្វាក់ មានន័យថាដង្កៀបពុម្ពរលុង។', 'ຖ້າໄດ້ຍິນສຽງ “ແກັກ” ສອງເທື່ອທຸກຈັງຫວະ ແປວ່າຕົວຈັບແມ່ພິມຫຼວມ.') },
      { at: 48, text: L('Stop at top dead centre and re-torque the four clamp bolts.', 'หยุดที่ตำแหน่งบนสุด แล้วขันน็อตตัวจับทั้งสี่ตัวใหม่', '上死点で止め、クランプボルト4本を締め直す。', 'အပေါ်ဆုံးအမှတ်တွင် ရပ်ပြီး ညှပ်မူလီ လေးခုကို ပြန်ကျပ်ပါ။', 'ឈប់នៅចំណុចកំពូល ហើយរឹតប៊ូឡុងដង្កៀបទាំងបួនឡើងវិញ។', 'ຢຸດທີ່ຕຳແໜ່ງເທິງສຸດ ແລ້ວຂັນນັອດຕົວຈັບທັງສີ່ໃໝ່.') },
    ],
  },
];

export interface KbQuestion {
  id: string;
  text: Translated;
  /** Words (any language, lower-case) that point to this question. */
  keywords: string[];
  /** The answer = these moments from senior tips, in order. */
  cites: { entryId: string; at: number }[];
}

export const QUESTIONS: KbQuestion[] = [
  {
    id: 'q-bolt',
    text: L('Press-02 bolt is stripped, how do I fix it?', 'เครื่อง Press-02 น็อตหวาน แก้ยังไง', 'Press-02のボルトがなめた。どう直す？', 'Press-02 မူလီ ချောနေသည်၊ ဘယ်လိုပြင်ရမလဲ။', 'ប៊ូឡុង Press-02 រលួស ជួសជុលយ៉ាងម៉េច?', 'ເຄື່ອງ Press-02 ນັອດຫວານ ແກ້ແນວໃດ?'),
    keywords: ['bolt', 'thread', 'strip', 'press', 'guard', 'น็อต', 'เกลียว', 'หวาน', 'ฝาครอบ', 'ボルト', 'ねじ', 'なめ', 'プレス', 'မူလီ', 'ប៊ូឡុង', 'ນັອດ', 'ເກືອວ', '-02'],
    cites: [
      { entryId: 'kb-bolt', at: 0 },
      { entryId: 'kb-bolt', at: 42 },
      { entryId: 'kb-bolt', at: 84 },
      { entryId: 'kb-bolt', at: 135 },
    ],
  },
  {
    id: 'q-spindle',
    text: L('Spindle makes a grinding noise. What should I check?', 'แกนหมุนมีเสียงครูด ต้องเช็กอะไร', '主軸からゴリゴリ音。何を確認する？', 'ဝင်ရိုးမှ အသံထွက်နေသည်။ ဘာစစ်ရမလဲ။', 'អ័ក្សបង្វិលមានសំឡេងកកិត។ ត្រូវពិនិត្យអ្វី?', 'ແກນໝູນມີສຽງຄູດ ຕ້ອງກວດຫຍັງ?'),
    keywords: ['spindle', 'grind', 'noise', 'bearing', 'cnc', 'แกนหมุน', 'ครูด', 'เสียง', 'แบริ่ง', '主軸', '異音', 'ゴリゴリ', 'ベアリング', 'ဝင်ရိုး', 'អ័ក្ស', 'ແກນໝູນ', '01'],
    cites: [
      { entryId: 'kb-spindle', at: 0 },
      { entryId: 'kb-spindle', at: 35 },
      { entryId: 'kb-spindle', at: 100 },
    ],
  },
  {
    id: 'q-grease',
    text: L('Machine 03 is running hot. What do I do?', 'เครื่อง 03 ร้อนผิดปกติ ทำยังไงดี', '機械03が異常に熱い。どうする？', 'စက် 03 ပူနေသည်။ ဘာလုပ်ရမလဲ။', 'ម៉ាស៊ីន 03 ក្តៅខុសធម្មតា។ ធ្វើដូចម្តេច?', 'ເຄື່ອງ 03 ຮ້ອນຜິດປົກກະຕິ ເຮັດແນວໃດ?'),
    keywords: ['hot', 'heat', 'grease', 'temperature', 'ร้อน', 'จาระบี', '熱', 'グリス', 'ပူ', 'ក្តៅ', 'ຮ້ອນ', '03'],
    cites: [
      { entryId: 'kb-hot', at: 0 },
      { entryId: 'kb-hot', at: 1 },
      { entryId: 'kb-hot', at: 2 },
    ],
  },
];

/** Scripted "AI": pick the question whose keywords match best, or none (never guesses). */
export function matchQuestion(input: string): KbQuestion | undefined {
  const q = input.toLowerCase();
  let best: KbQuestion | undefined;
  let bestScore = 0;
  for (const item of QUESTIONS) {
    const score = item.keywords.filter((k) => q.includes(k)).length;
    if (score > bestScore) {
      best = item;
      bestScore = score;
    }
  }
  return best;
}

export const FORMATS: KnowledgeFormat[] = ['VIDEO', 'VOICE', 'TEXT'];

/** 84 → "1:24" */
export const clock = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
