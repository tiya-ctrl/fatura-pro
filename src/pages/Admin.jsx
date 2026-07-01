import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const ADMIN_EMAIL = 'tiyad1312@gmail.com';

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('referrals');

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === ADMIN_EMAIL) {
        setAuthed(true);
        const { data: refs } = await supabase.from('user_plans').select('*').not('referred_by', 'is', null).order('updated_at', { ascending: false });
        const { data: wait } = await supabase.from('waitlist').select('*').order('created_at', { ascending: false });
        setReferrals(refs || []);
        setWaitlist(wait || []);
      }
      setLoading(false);
    };
    check();
  }, []);

  if (loading) return <div style={{ padding:40, color:'#e8e4dc', background:'#08080e', minHeight:'100vh' }}>Loading...</div>;

  const getReferralStats = () => {
    const stats = {};
    referrals.forEach(r => {
      const code = r.referred_by;
      stats[code].count++;
      stats[code].emails.push(r.email || r.user_id.slice(0,8));
    });
    return Object.values(stats).sort((a,b) => b.count - a.count);
  };

  const stats = getReferralStats();

  return (
    <div style={{ minHeight:'100vh', background:'#08080e', color:'#e8e4dc', fontFamily:'DM Sans, sans-serif', padding:32 }}>
      <div style={{ maxWidth:900, margin:'0 auto' }}>
        <h1 style={{ fontFamily:'Playfair Display, serif', fontSize:28, color:'#c9a84c', marginBottom:8 }}>Fatūra Admin</h1>
        <div style={{ display:'flex', gap:8, marginBottom:24 }}>
          {['referrals', 'waitlist'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding:'8px 20px', borderRadius:8, border:'1px solid', cursor:'pointer', fontFamily:'DM Sans, sans-serif', fontWeight:600, fontSize:13, background: tab===t ? '#c9a84c' : '#111118', color: tab===t ? '#000' : '#9a9690', borderColor: tab===t ? '#c9a84c' : 'rgba(201,168,76,0.2)' }}>
              {t === 'referrals' ? 'Referrals (' + referrals.length + ')' : 'Waitlist (' + waitlist.length + ')'}
            </button>
          ))}
        </div>
        {tab === 'referrals' && (
          <div>
            {stats.map(s => (
              <div key={s.code} style={{ background:'#111118', border:'1px solid rgba(201,168,76,0.2)', borderRadius:10, padding:'14px 20px', marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:700 }}>Code: {s.code}</div>
                  <div style={{ fontSize:12, color:'#9a9690' }}>{s.emails.join(', ')}</div>
                </div>
                <div style={{ fontSize:24, fontWeight:700, color: s.count >= 3 ? '#4caf89' : '#c9a84c' }}>{s.count} {s.count >= 3 ? '🎁' : ''}</div>
              </div>
            ))}
            {stats.length === 0 && <p style={{ color:'#9a9690' }}>No referrals yet.</p>}
          </div>
        )}
        {tab === 'waitlist' && (
          <div>
            {waitlist.map(w => (
              <div key={w.id} style={{ background:'#111118', border:'1px solid rgba(201,168,76,0.18)', borderRadius:10, padding:'12px 20px', marginBottom:8, display:'flex', justifyContent:'space-between' }}>
                <span>{w.email}</span>
                <span style={{ fontSize:12, color:'#9a9690' }}>{new Date(w.created_at).toLocaleDateString()}</span>
              </div>
            ))}
            {waitlist.length === 0 && <p style={{ color:'#9a9690' }}>No waitlist entries yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}