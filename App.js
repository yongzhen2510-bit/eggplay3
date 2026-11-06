// 玩擲 — single-file build for Expo Snack. Edit API_URL in the 'config' module below to connect a server.
import * as E0 from 'react';
import * as E1 from 'react-native';
import * as E2 from 'expo-status-bar';
import * as E3 from 'react-native-safe-area-context';
import * as E4 from 'react-native-svg';
import * as E5 from '@react-native-async-storage/async-storage';

const __defs = {}; const __cache = {};
function __d(id, f) { __defs[id] = f; }
function __r(id) {
  if (__cache[id]) return __cache[id].exports;
  const m = { exports: {} }; __cache[id] = m;
  __defs[id](m.exports, __r);
  return m.exports;
}

// ---- App
__d('App', function (exports, __r) {
const React = E0.default;
const { useEffect, useRef, useState } = E0;
const { Animated, BackHandler, Pressable, View } = E1;
const { StatusBar } = E2;
const { SafeAreaProvider, useSafeAreaInsets } = E3;
const ChatToast = __r('components/ChatToast').default;
const { Icon } = __r('components/icons');
const Logo = __r('components/Logo').default;
const { ScreenEnter, spring, T, useReducedMotion } = __r('components/ui');
const AuthScreen = __r('screens/AuthScreen').default;
const ChatRoomScreen = __r('screens/ChatScreen').default;
const { ChatListScreen } = __r('screens/ChatScreen');
const FavoritesScreen = __r('screens/FavoritesScreen').default;
const GameListScreen = __r('screens/GameListScreen').default;
const GameScreen = __r('screens/GameScreen').default;
const HomeScreen = __r('screens/HomeScreen').default;
const ProfileScreen = __r('screens/ProfileScreen').default;
const { StoreProvider, useStore } = __r('state/store');
const { useColors } = __r('theme/tokens');

const TABS = [
  { id: 'home', icon: 'gamepad', zh: '首頁', en: 'Home' },
  { id: 'favorites', icon: 'heart', zh: '收藏', en: 'Saved' },
  { id: 'chat', icon: 'chat', zh: '聊天室', en: 'Chat' },
  { id: 'me', icon: 'person', zh: '我的', en: 'Me' },
];
const TAB_GAP = 4;

function TabBar({ tab, onChange }) {
  const c = useColors();
  const { tr } = useStore();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const placedWidth = useRef(0);
  const slot = (width - TAB_GAP * (TABS.length - 1)) / TABS.length;
  const index = TABS.findIndex(t => t.id === tab);

  // The highlight slides to the chosen tab, but jumps into place on first layout and after a resize.
  useEffect(() => {
    if (!width) return;
    const target = index * (slot + TAB_GAP);
    if (placedWidth.current !== width) { placedWidth.current = width; x.setValue(target); return; }
    spring(x, target, { response: 0.36, ratio: 0.82, reduced });
  }, [index, width]);

  return (
    <View style={{ paddingHorizontal: 8, paddingTop: 6, backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.separator, paddingBottom: Math.max(insets.bottom, 6) }}>
      <View accessibilityRole="tablist" onLayout={e => setWidth(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', gap: TAB_GAP }}>
        {width > 0 && <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: slot, borderRadius: 16, backgroundColor: c.accentTint, transform: [{ translateX: x }] }} />}
        {TABS.map(item => {
          const on = item.id === tab;
          const color = on ? c.accent : c.secondary;
          return (
            <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: on }} aria-selected={on} onPress={() => onChange(item.id)}
              style={{ flex: 1, minHeight: 58, alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: 6 }}>
              <Icon name={item.icon} size={22} color={color} filled={on} />
              <T v="caption" color={color} style={{ fontWeight: on ? '600' : '500' }}>{tr(item.zh, item.en)}</T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Root() {
  const c = useColors();
  const store = useStore();
  const [tab, setTab] = useState('home');
  const [stack, setStack] = useState([]);
  const dir = useRef(0);

  const nav = {
    push: (name, params) => { dir.current = 1; setStack(s => [...s, { name, params, key: `${name}-${Date.now()}` }]); },
    replace: (name, params) => { dir.current = 1; setStack(s => [...s.slice(0, -1), { name, params, key: `${name}-${Date.now()}` }]); },
    back: () => { dir.current = -1; setStack(s => s.slice(0, -1)); },
    tab: id => { dir.current = 0; setStack([]); setTab(id); },
  };

  const needsAuth = store.authOpen || (!store.user && !store.skippedAuth);
  useEffect(() => { if (store.user && store.authOpen) store.setAuthOpen(false); }, [store.user?.id]);

  useEffect(() => {
    const sub = BackHandler.addEventListener?.('hardwareBackPress', () => {
      if (store.authOpen) { store.setAuthOpen(false); return true; }
      if (stack.length) { nav.back(); return true; }
      if (tab !== 'home') { nav.tab('home'); return true; }
      return false;
    });
    return () => sub?.remove?.();
  }, [stack.length, tab, store.authOpen]);

  if (!store.ready) return <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}><Logo size={88} /></View>;
  if (needsAuth) return <AuthScreen />;

  const top = stack[stack.length - 1];
  const content = top ? (
    top.name === 'game' ? <GameScreen gameId={top.params.id} nav={nav} />
      : top.name === 'list' ? <GameListScreen type={top.params.type} nav={nav} />
        : <ChatRoomScreen room={top.params.room} nav={nav} />
  ) : tab === 'home' ? <HomeScreen nav={nav} />
    : tab === 'favorites' ? <FavoritesScreen nav={nav} />
      : tab === 'chat' ? <ChatListScreen nav={nav} />
        : <ProfileScreen />;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, overflow: 'hidden' }}>
      <ScreenEnter key={top ? top.key : `tab-${tab}`} dir={dir.current}>{content}</ScreenEnter>
      {!top && <TabBar tab={tab} onChange={nav.tab} />}
      <ChatToast activeRoom={top?.name === 'room' ? top.params.room : null} muted={top?.name === 'game'} onOpen={room => nav.push('room', { room })} />
    </View>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="auto" />
        <Root />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

exports.default = App;
});

// ---- assets/logo
__d('assets/logo', function (exports, __r) {
// favicon.jpg, cropped to the artwork and resized to 320 x 320.
const LOGO_URI = 'data:image/jpeg;base64,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';

exports.LOGO_URI = LOGO_URI;
});

// ---- components/ChatToast
__d('components/ChatToast', function (exports, __r) {
const React = E0.default;
const { useEffect, useRef, useState } = E0;
const { Animated, Pressable, View } = E1;
const { useSafeAreaInsets } = E3;
const { Badge, IconButton, spring, T, useReducedMotion } = __r('components/ui');
const { ROOMS } = __r('data/rooms');
const { chatSocket } = __r('lib/api');
const { useStore } = __r('state/store');
const { useColors } = __r('theme/tokens');

const SHOW_MS = 5000;
const EXIT_MS = 250;
const RECONNECT_MS = 3000;

// Listens to every room and shows new messages from other people. `muted` covers the moments a popup
// would get in the way: mid-game, where it could cover a timed board, and in the room being read.
function ChatToast({ activeRoom, muted, onOpen }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const { tr, user } = useStore();
  const [message, setMessage] = useState(null);
  const a = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef(null);
  const clearTimer = useRef(null);
  const latest = useRef({});
  latest.current = { activeRoom, muted, userId: user?.id };

  const hide = () => {
    clearTimeout(hideTimer.current);
    spring(a, 0, { response: 0.3, reduced });
    clearTimer.current = setTimeout(() => setMessage(null), EXIT_MS);
  };

  const show = m => {
    clearTimeout(hideTimer.current);
    clearTimeout(clearTimer.current);
    setMessage(m);
    spring(a, 1, { response: 0.36, ratio: 0.85, reduced });
    hideTimer.current = setTimeout(hide, SHOW_MS);
  };

  useEffect(() => {
    let alive = true;
    let socket = null;
    let retry = null;
    const connect = () => {
      socket = chatSocket();
      if (!socket) return;
      socket.onmessage = e => {
        const m = JSON.parse(e.data);
        const { activeRoom: open, muted: quiet, userId } = latest.current;
        if (quiet || m.room === open || m.user_id === userId || !ROOMS.some(r => r.id === m.room)) return;
        show(m);
      };
      socket.onclose = () => { if (alive) retry = setTimeout(connect, RECONNECT_MS); };
    };
    connect();
    return () => {
      alive = false;
      clearTimeout(retry);
      clearTimeout(hideTimer.current);
      clearTimeout(clearTimer.current);
      socket?.close();
    };
  }, []);

  // Never leave a popup covering the screen the player just moved to.
  useEffect(() => { if (message && (muted || message.room === activeRoom)) hide(); }, [muted, activeRoom]);

  if (!message) return null;
  const room = ROOMS.find(r => r.id === message.room);
  return (
    <Animated.View pointerEvents="box-none" accessibilityLiveRegion="polite" style={{
      position: 'absolute', top: insets.top + 8, left: 12, right: 12, alignItems: 'center', opacity: a,
      transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) }],
    }}>
      <View style={{
        width: '100%', maxWidth: 616, flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1, borderColor: c.edge, backgroundColor: c.surface,
        shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 6,
      }}>
        <Pressable accessibilityRole="button" accessibilityLabel={tr(`${message.author} 傳來訊息：${message.body}。開啟聊天室`, `${message.author} says: ${message.body}. Open chat room`)}
          onPress={() => { hide(); onOpen(message.room); }}
          style={({ pressed }) => ({ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingRight: 4, borderRadius: 18, opacity: pressed ? 0.6 : 1 })}>
          <Badge icon={room.icon} size={40} />
          <View style={{ flex: 1 }}>
            <T v="subhead" numberOfLines={1} style={{ fontWeight: '600' }}>{message.author}</T>
            <T v="footnote" color={c.secondary} numberOfLines={2}>{message.body}</T>
          </View>
        </Pressable>
        <IconButton icon="close" label={tr('關閉通知', 'Dismiss notification')} color={c.secondary} onPress={hide} />
      </View>
    </Animated.View>
  );
}

exports.default = ChatToast;
});

// ---- components/GameRow
__d('components/GameRow', function (exports, __r) {
const React = E0.default;
const { View } = E1;
const { Badge, Chip, IconButton, Row } = __r('components/ui');
const { useStore } = __r('state/store');
const { useColors } = __r('theme/tokens');

const formatSecs = (s, tr) => (s < 60 ? tr(`${s} 秒`, `${s}s`) : tr(`${Math.round(s / 60)} 分`, `${Math.round(s / 60)} min`));

function GameRow({ game, nav, last }) {
  const c = useColors();
  const { tr, played, favorites, toggleFavorite } = useStore();
  const saved = favorites.includes(game.id);
  const name = tr(game.zh, game.en);
  return (
    <Row last={last} label={name} title={name} subtitle={tr(game.dz, game.de)} onPress={() => nav.push('game', { id: game.id })}
      leading={<Badge icon={game.icon} tone={game.type} />}
      trailing={
        <View style={{ alignItems: 'flex-end', gap: 3 }}>
          {!played[game.id] && <Chip tone="accent" text={tr('沒玩過', 'New')} />}
          <Chip text={formatSecs(game.secs, tr)} />
        </View>
      }
      accessory={
        <IconButton icon="heart" filled={saved} color={saved ? c.danger : c.secondary}
          label={saved ? tr(`取消收藏${name}`, `Remove ${name} from saved`) : tr(`收藏${name}`, `Save ${name}`)} onPress={() => toggleFavorite(game.id)} />
      } />
  );
}

exports.default = GameRow;
exports.formatSecs = formatSecs;
});

// ---- components/InstallCard
__d('components/InstallCard', function (exports, __r) {
const React = E0.default;
const { View } = E1;
const { Icon } = __r('components/icons');
const Logo = __r('components/Logo').default;
const { Button, Group, IconButton, T } = __r('components/ui');
const { useInstall } = __r('lib/install');
const { useStore } = __r('state/store');
const { useColors } = __r('theme/tokens');

function Step({ n, children }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 28 }}>
      <View style={{ width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: c.accentTint }}>
        <T v="caption" color={c.accent}>{n}</T>
      </View>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>{children}</View>
    </View>
  );
}

// Home shows it only where installing is possible, and it can be dismissed. Profile keeps it available.
function InstallCard({ dismissible, style }) {
  const c = useColors();
  const { tr, installDismissed, dismissInstall } = useStore();
  const { mode, install } = useInstall();
  if (mode === 'none') return null;
  if (dismissible && (installDismissed || mode === 'menu')) return null;
  return (
    <Group style={style}>
      <View style={{ padding: 14, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Logo size={44} />
          <View style={{ flex: 1 }}>
            <T v="headline">{tr('加到裝置', 'Add to Device')}</T>
            <T v="footnote" color={c.secondary}>{tr('從主畫面直接開，像一般 App 一樣', 'Open it from your home screen like any app')}</T>
          </View>
          {dismissible && <IconButton icon="close" label={tr('不用了', 'No thanks')} color={c.secondary} onPress={dismissInstall} />}
        </View>
        {mode === 'prompt' && <Button icon="download" title={tr('加到裝置', 'Add to Device')} onPress={install} />}
        {mode === 'ios' && (
          <View style={{ gap: 6 }}>
            <Step n={1}>
              <T v="subhead">{tr('點瀏覽器的分享按鈕', 'Tap the browser\'s Share button')}</T>
              <Icon name="share" size={18} color={c.accent} />
            </Step>
            <Step n={2}><T v="subhead">{tr('選「加入主畫面」', 'Choose "Add to Home Screen"')}</T></Step>
            <Step n={3}><T v="subhead">{tr('點「新增」就完成了', 'Tap "Add" and you\'re done')}</T></Step>
          </View>
        )}
        {mode === 'menu' && <T v="subhead" color={c.secondary}>{tr('如果瀏覽器支援，可以在瀏覽器選單裡找到安裝或加到主畫面的選項。', 'If your browser supports it, look for an install or Add to Home Screen option in its menu.')}</T>}
      </View>
    </Group>
  );
}

exports.default = InstallCard;
});

// ---- components/Logo
__d('components/Logo', function (exports, __r) {
const React = E0.default;
const { Image, View } = E1;
const { LOGO_URI } = __r('assets/logo');

// The app icon, embedded as a data URI so it also survives Expo Snack's git import,
// which rejects repositories that contain image files.
function Logo({ size = 44, children, style }) {
  const radius = Math.round(size * 0.25);
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[{ width: size, height: size, borderRadius: radius, overflow: 'hidden', backgroundColor: '#5E6336' }, style]}>
      <Image source={{ uri: LOGO_URI }} style={{ width: size, height: size }} resizeMode="cover" />
      {children}
    </View>
  );
}

exports.default = Logo;
});

// ---- components/Mascot
__d('components/Mascot', function (exports, __r) {
const React = E0.default;
const { useEffect, useRef } = E0;
const { Animated, View } = E1;
const Logo = __r('components/Logo').default;
const { spring, useReducedMotion } = __r('components/ui');
const { useColors } = __r('theme/tokens');

const SIZE = 112;

// The app icon comes to life: its hands rise to cover its eyes while you type a password.
function Mascot({ covering }) {
  const c = useColors();
  const reduced = useReducedMotion();
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => { spring(y, covering ? 1 : 0, { response: 0.3, ratio: 0.85, reduced }); }, [covering]);
  const lift = y.interpolate({ inputRange: [0, 1], outputRange: [SIZE * 0.72, 0] });
  const hand = left => <Animated.View style={{ position: 'absolute', left, top: SIZE * 0.3, width: 30, height: SIZE, borderRadius: 15, backgroundColor: c.paw, borderWidth: 1, borderColor: 'rgba(92,70,36,0.28)', transform: [{ translateY: lift }] }} />;
  return <View style={{ alignSelf: 'center' }}><Logo size={SIZE}>{hand(SIZE * 0.17)}{hand(SIZE * 0.51)}</Logo></View>;
}

exports.default = Mascot;
});

// ---- components/PickerSheet
__d('components/PickerSheet', function (exports, __r) {
const React = E0.default;
const { useEffect, useRef, useState } = E0;
const { Animated, Dimensions, Modal, Platform, Pressable, View } = E1;
const { useSafeAreaInsets } = E3;
const { formatSecs } = __r('components/GameRow');
const { Badge, Button, spring, T, useReducedMotion } = __r('components/ui');
const { GAMES, shuffle } = __r('games/catalog');
const { useStore } = __r('state/store');
const { useColors } = __r('theme/tokens');

// For the undecided: the app decides. Names flick past briefly, then land on something fresh.
function PickerSheet({ onClose, onPlay }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const { tr, pickFresh, played } = useStore();
  const [shown, setShown] = useState(() => pickFresh());
  const [landed, setLanded] = useState(false);
  const y = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const scrim = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);

  const roll = () => {
    clearInterval(timer.current);
    const target = pickFresh(landed ? shown.id : undefined);
    if (reduced) { setShown(target); setLanded(true); return; }
    setLanded(false);
    const reel = shuffle(GAMES).slice(0, 9);
    let i = 0;
    timer.current = setInterval(() => {
      if (i >= reel.length) { clearInterval(timer.current); setShown(target); setLanded(true); return; }
      setShown(reel[i++]);
    }, 70);
  };

  useEffect(() => {
    spring(y, 0, { response: 0.36 }); spring(scrim, 1, { response: 0.3 });
    roll();
    return () => clearInterval(timer.current);
  }, []);

  const close = () => { clearInterval(timer.current); onClose(); };
  const name = tr(shown.zh, shown.en);

  return (
    <Modal transparent visible animationType="none" onRequestClose={close} statusBarTranslucent={Platform.OS === 'android'}>
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.scrim, opacity: scrim }}>
        <Pressable accessibilityRole="button" accessibilityLabel={tr('關閉', 'Close')} style={{ flex: 1 }} onPress={close} />
      </Animated.View>
      <View style={{ flex: 1 }} pointerEvents="box-none" />
      <Animated.View accessibilityViewIsModal style={{ backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 24 + insets.bottom, width: '100%', maxWidth: 640, alignSelf: 'center', transform: [{ translateY: reduced ? 0 : y }] }}>
        <T v="subhead" color={c.secondary} style={{ textAlign: 'center' }}>{tr('今天就玩這款', 'Today you are playing')}</T>
        <View style={{ alignItems: 'center', marginTop: 14, marginBottom: 6 }}><Badge icon={shown.icon} tone={shown.type} size={80} /></View>
        <T v="title" accessibilityLiveRegion="polite" style={{ textAlign: 'center', marginTop: 6 }}>{name}</T>
        <T v="subhead" color={c.secondary} style={{ textAlign: 'center', marginTop: 4, minHeight: 21 }}>
          {landed ? `${tr(shown.dz, shown.de)} · ${formatSecs(shown.secs, tr)}${played[shown.id] ? '' : tr(' · 沒玩過', ' · New')}` : ' '}
        </T>
        <Button style={{ marginTop: 20 }} disabled={!landed} icon="play" title={tr('就決定是你了！', "You're the one!")} onPress={() => onPlay(shown)} />
        <Button style={{ marginTop: 10 }} kind="secondary" icon="shuffle" title={tr('換一個', 'Pick Another')} onPress={roll} />
      </Animated.View>
    </Modal>
  );
}

exports.default = PickerSheet;
});

// ---- components/icons
__d('components/icons', function (exports, __r) {
const React = E0.default;
const Svg = E4.default;
const { Path } = E4;

// The app's own icon set: one 24 x 24 grid, one stroke weight, drawn as plain SVG paths.
const o = (x, y, r) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;
const rr = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;

// Interface
const UI = {
  gamepad: 'M7 7.5h10a5 5 0 0 1 4.8 3.7l1 3.8a2.9 2.9 0 0 1-4.9 2.7L15.5 15.5h-7l-2.4 2.2a2.9 2.9 0 0 1-4.9-2.7l1-3.8A5 5 0 0 1 7 7.5zM7.5 10v3M6 11.5h3M15.5 10.5h.01M18 12.5h.01',
  heart: 'M12 20.5s-8.5-5-8.5-11A4.8 4.8 0 0 1 12 6.8a4.8 4.8 0 0 1 8.5 2.7c0 6-8.5 11-8.5 11z',
  chat: 'M6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10.5l-5 3.5V17A2.5 2.5 0 0 1 4 14.5v-8A2.5 2.5 0 0 1 6.5 4z',
  person: `${o(12, 8, 4)}M4.5 20.5a7.5 7.5 0 0 1 15 0z`,
  play: 'M8 5.5v13l10.5-6.5z',
  shuffle: 'M3 7h3.5c2 0 3.4 1 4.5 2.6l2 2.8c1.1 1.6 2.5 2.6 4.5 2.6H21M18 12l3 3-3 3M3 17h3.5c1.4 0 2.5-.5 3.4-1.4M14.1 8.4c.9-.9 2-1.4 3.4-1.4H21M18 4l3 3-3 3',
  dice: `${rr(4, 4, 16, 16, 4)}M8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01`,
  refresh: 'M20 11a8 8 0 1 0-2.3 6.1M20 5v6h-6',
  send: 'M21 3 10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5z',
  close: 'M6 6l12 12M18 6 6 18',
  eye: `M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z${o(12, 12, 3)}`,
  eyeOff: 'M4 4l16 16M9.9 5.8A9 9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3 3.8M6.2 7.6A15.5 15.5 0 0 0 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.2-1.1M10 10a3 3 0 0 0 4.1 4.1',
  logIn: 'M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M4 12h11M11 8l4 4-4 4',
  logOut: 'M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M10 12h11M17 8l4 4-4 4',
  chevronLeft: 'M15 5l-7 7 7 7',
  chevronRight: 'M9 5l7 7-7 7',
  arrowUp: 'M12 20V4M5.5 10.5 12 4l6.5 6.5',
  arrowDown: 'M12 4v16M5.5 13.5 12 20l6.5-6.5',
  arrowLeft: 'M20 12H4M10.5 5.5 4 12l6.5 6.5',
  arrowRight: 'M4 12h16M13.5 5.5 20 12l-6.5 6.5',
  checkCircle: `${o(12, 12, 9)}M8 12.5l2.7 2.7L16 9.5`,
  closeCircle: `${o(12, 12, 9)}M9 9l6 6M15 9l-6 6`,
  alertCircle: `${o(12, 12, 9)}M12 7.5V13M12 16.5h.01`,
  infoCircle: `${o(12, 12, 9)}M12 11v5.5M12 7.5h.01`,
  timer: `${o(12, 13.5, 7.5)}M12 9.5v4l2.5 2M9.5 2.5h5M19 6l-1.5 1.5`,
  hourglass: 'M6.5 3h11M6.5 21h11M8 3v3.5c0 2 1.5 3.5 4 5.5 2.5-2 4-3.5 4-5.5V3M8 21v-3.5c0-2 1.500-3.500 4-5.500 2.500 2 4 3.500 4 5.500V21',
  flag: 'M6 21V4M6 4.5c4-2.500 8 2.500 12.500 0v9c-4.500 2.500-8.500-2.500-12.500 0',
  puzzle: 'M10 4.500a2 2 0 0 1 4 0V7h4a1 1 0 0 1 1 1v3.500h-.5a2 2 0 0 0 0 4h.5V19a1 1 0 0 1-1 1h-3.500v-.5a2 2 0 0 0-4 0v.5H6a1 1 0 0 1-1-1v-3.500h.5a2 2 0 0 0 0-4H5V8a1 1 0 0 1 1-1h4z',
  trophy: 'M7.500 3.500h9V10a4.500 4.500 0 0 1-9 0zM7.500 5.500h-3V7a3.500 3.500 0 0 0 3.300 4.500M16.500 5.500h3V7a3.500 3.500 0 0 1-3.300 4.500M12 14.500V18M8.500 20.500h7M10 18h4l1.500 2.500h-7z',
  download: 'M12 4v11M7.5 10.5 12 15l4.5-4.5M4 19.5h16',
  share: 'M12 15V3.5M8 7l4-3.5L16 7M7 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1',
  party: 'M4 20.500 8.500 8l7.500 7.500zM13 4.500h.01M19.500 4.500l-3 3M20 11h.01M14 3.500c1 1.500 1 3-.5 4.500M16 14c1-1 3-1.500 4.500-.5M18 18h.01',
};

// One per game
const GAME = {
  grid: `${rr(3.5, 3.5, 17, 17, 3.5)}M9.200 3.500v17M14.800 3.500v17M3.500 9.200h17M3.500 14.800h17`,
  letters: `M3 18.500 8 5.500l5 13M4.800 14h6.400${o(17.5, 15, 3.5)}M21 11.500v7`,
  search: `${o(10.5, 10.5, 6.5)}M15.500 15.500 21 21`,
  match: 'M5.500 21 13 10.500M14.500 3c.4 2.200 3.500 3.500 3.500 6.200a3.500 3.500 0 0 1-7 0c0-1.600.9-2.400 1.600-3.200.3 1 .9 1.500 1.400 1.700-.3-1.700-.2-3.200.5-4.700z',
  tiles: `${rr(3.5, 3.5, 7.5, 7.5, 2)}${rr(13, 3.5, 7.5, 7.5, 2)}${rr(3.5, 13, 7.5, 7.5, 2)}M13.500 16.750h6M17 14.250l2.500 2.500-2.500 2.500`,
  cards: 'M9 3.500h9a2 2 0 0 1 2 2V16a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5.500a2 2 0 0 1 2-2zM4 7.500V18.500a2 2 0 0 0 2 2h9M13.500 8l2 2.750-2 2.750-2-2.750z',
  bulb: 'M9.500 17.500h5M10 21h4M8.700 14.500a6.500 6.500 0 1 1 6.600 0c-.5.4-.8 1-.8 1.600v1.400h-5v-1.400c0-.6-.3-1.200-.8-1.600z',
  maze: `${rr(3.5, 3.5, 17, 17, 3.5)}M8 3.500V12h4.500M16 20.500V12M8 16h4.500M12.500 7.500H16`,
  branch: `${o(6, 5.5, 2.5)}${o(6, 18.5, 2.5)}${o(18, 12, 2.5)}M6 8v8M8.200 6.600c4 .6 3.300 5.400 7.300 5.400`,
  merge: `${rr(3, 3, 8, 8, 2)}${rr(13, 13, 8, 8, 2)}M13 7h5a1 1 0 0 1 1 1v2.500M11 17H6a1 1 0 0 1-1-1v-2.500`,
  flash: 'M13.500 2.500 5 13.500h6l-1 8 8.500-11h-6z',
  truefalse: `${o(7.5, 12, 4.5)}M14.500 8l7 8M21.500 8l-7 8`,
  scroll: 'M17 4H7.500A2.500 2.500 0 0 0 5 6.500V16H3.500v1.500a3 3 0 0 0 3 3H15a3 3 0 0 0 3-3V7h2.500V6A2 2 0 0 0 18.500 4zM9 9h5M9 13h5',
  question: `${o(12, 12, 9)}M9.400 9.400a2.700 2.700 0 1 1 3.900 2.400c-.8.4-1.300 1-1.300 1.900v.3M12 17h.01`,
  calc: `${rr(4, 3, 16, 18, 3)}M8 7.500h8M8 12h.01M12 12h.01M16 12h.01M8 16.500h.01M12 16.500h.01M16 16.500h.01`,
  palette: 'M12 3a9 9 0 1 0 0 18c1.400 0 2-1 2-1.900 0-.6-.3-1-.6-1.400-.3-.4-.6-.8-.6-1.300 0-1 .8-1.600 1.700-1.600H17a4 4 0 0 0 4-4C21 6.300 17 3 12 3zM7.500 11.500h.01M9.500 7.500h.01M14.500 7.500h.01M17 11h.01',
  stoplight: `${rr(7.5, 2.5, 9, 19, 3.5)}${o(12, 7, 1.5)}${o(12, 12, 1.5)}${o(12, 17, 1.5)}`,
  speed: 'M4 18a9.500 9.500 0 1 1 16 0M12 14l4-5M12 14h.01',
  music: `M9 18V5.500l11-2V16${o(6.5, 18, 2.5)}${o(17.5, 16, 2.5)}`,
};

// One per chat room
const ROOM = {
  shield: 'M12 3l7.500 2.800V11c0 5-3.200 8.300-7.500 10-4.300-1.700-7.500-5-7.500-10V5.800zM13 7.500 9.500 12.500h5L11 17',
  sofa: 'M5.500 11V8a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v3M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v4a1.500 1.500 0 0 1-1.500 1.500h-15A1.500 1.500 0 0 1 3 17zM6 18.500v2M18 18.500v2',
  people: `${o(9, 8, 3.5)}M2.500 20a6.500 6.500 0 0 1 13 0M15.500 4.800a3.500 3.500 0 0 1 0 6.400M18 14.500a6.500 6.500 0 0 1 3.500 5.500`,
  plane: 'M21 3c-1-1-2.800-.6-3.800.4L13.500 7.100 5 5 3.500 6.500l7 4.200L7 14.500H4.500L3 16l4 1.500L8.500 21.500 10 20v-2.500l3.800-3.800 4.200 7 1.500-1.500-2.500-8.500 3.600-3.700c1-1 1.400-2.800.4-3.500z',
};

// Pictures used as game content: memory cards, spot-the-odd and rebus clues.
const PICTURES = {
  pizza: 'M12 21.500 3.500 6.500c5-3 12-3 17 0zM5.500 9.800c4-2 9-2 13 0M10 12.500h.01M14.500 12.700h.01M12 16.500h.01',
  panda: `${o(12, 13, 7.5)}${o(6, 6.5, 2.5)}${o(18, 6.5, 2.5)}M9.300 12h.01M14.700 12h.01M12 15v.5M10.500 17c1 .7 2 .7 3 0`,
  rocket: `M12 2.500c3.500 2.500 5 6 5 9.500v4H7v-4c0-3.500 1.500-7 5-9.500zM7 12.500l-3 3.500v3.500l3-2M17 12.500l3 3.500v3.500l-3-2M10 19.500c.4 1 1 1.500 2 2.500 1-1 1.600-1.500 2-2.500${o(12, 9.5, 1.8)}`,
  guitar: `M20.500 3.500l-7 7M18.500 2.500l3 3M12.500 11.500c-1-1.500-3.300-1.500-4.300-.2-.5.6-.5 1.400-1.200 1.900-.9.6-2 .3-3 1.300-1.500 1.500-.8 4.100.8 5.700s4.200 2.300 5.700.8c1-1 .7-2.100 1.300-3 .5-.7 1.300-.7 1.900-1.200 1.300-1 1.300-3.300-.2-4.300z${o(9, 15, 1.5)}`,
  cactus: 'M12 21V4.500M12 15H8.500a3 3 0 0 1-3-3V9.500M12 12.500h3.500a3 3 0 0 0 3-3V7M7 21h10',
  fox: 'M4 4l2 8c0 5 3 8.500 6 9 3-.5 6-4 6-9l2-8-5 3.500H9zM9 12h.01M15 12h.01M11 16.500h2l-1 1.200z',
  donut: `${o(12, 12, 9)}${o(12, 12, 3)}M6.500 10l1 .8M9 6.500l.8 1M15 6.500l-.6 1.100M17.800 10.500l-1.100.4M16.500 16l-.9-.9M8 16.500l.8-.8`,
  ball: `${o(12, 12, 9)}M12 8l3.800 2.800-1.500 4.400H9.700L8.200 10.800zM12 3v5M20.600 9.500l-4.800 1.300M17.300 19.300l-3-4.100M6.700 19.300l3-4.100M3.400 9.500l4.800 1.300`,
  rainbow: 'M2.500 18.500a9.500 9.500 0 0 1 19 0M6 18.500a6 6 0 0 1 12 0M9.500 18.500a2.500 2.500 0 0 1 5 0',
  balloon: 'M12 3a6.500 6.500 0 0 1 6.500 6.500c0 4-3.500 7-6.500 8-3-1-6.500-4-6.500-8A6.500 6.500 0 0 1 12 3zM12 17.500 10.800 19h2.400zM12 19c0 1.300-1 1.300-1 2.500',
  watermelon: 'M2.500 7h19a9.500 9.500 0 0 1-19 0zM6 7a6 6 0 0 0 12 0M9.500 9.500h.01M14.500 9.500h.01M12 11.500h.01',
  dog: 'M8 4H5.500A2.500 2.500 0 0 0 3 6.500c0 2 .5 4 2 5.500M16 4h2.500A2.500 2.500 0 0 1 21 6.500c0 2-.5 4-2 5.500M8 4c2.500-1 5.500-1 8 0M5.500 9.500C5 15 8 20.500 12 20.500s7-5.500 6.500-11M9.500 11h.01M14.500 11h.01M10.500 15h3L12 16.700zM12 16.700V18',
  cat: 'M4.500 3.500 8 7c2.500-1 5.500-1 8 0l3.500-3.500V12c0 5-3.500 8.500-7.500 8.500S4.500 17 4.500 12zM9.500 12h.01M14.500 12h.01M11 15h2l-1 1.200zM2.500 14h3M2.500 17l3-.7M21.500 14h-3M21.500 17l-3-.7',
  star: 'M12 3l2.800 5.800 6.200.9-4.500 4.400 1.100 6.300-5.600-3-5.600 3 1.100-6.300L3 9.700l6.200-.9z',
  moon: 'M20.500 14A9 9 0 1 1 10 3.500a7 7 0 0 0 10.500 10.500z',
  apple: 'M12 7.500c-1.700-1.200-3.200-1.500-4.700-1-2.500.8-3.800 3.500-3.300 6.500.6 3.800 3 7.500 5.300 7.500 1 0 1.700-.6 2.700-.6s1.700.6 2.700.6c2.300 0 4.700-3.700 5.300-7.500.5-3-.8-5.700-3.300-6.500-1.500-.5-3-.2-4.700 1zM12 7.500c0-1.800.7-3.500 2.500-4.500',
  pear: 'M12 7c-2 0-3.500 1.500-3.500 3.500 0 1.800-3 3-3 6 0 3 3 4.500 6.500 4.500s6.500-1.500 6.500-4.500c0-3-3-4.200-3-6C15.500 8.500 14 7 12 7zM12 7c0-1.700.6-3 2-4',
  car: `M4 16.500V13l2-5.500a2 2 0 0 1 1.900-1.300h8.200A2 2 0 0 1 18 7.500l2 5.500v3.500M4 13h16M4 16.500h16${o(7.5, 18, 1.8)}${o(16.5, 18, 1.8)}`,
  bike: `${o(6, 16.5, 3.5)}${o(18, 16.5, 3.5)}M6 16.500 10 9h6l2 7.500M10 9l3.500 7.500H6M9 6.500h2.500M16 9l-1-2.500h2.500`,
  sun: `${o(12, 12, 4)}M12 2.500v2M12 19.500v2M2.500 12h2M19.500 12h2M5.300 5.300l1.400 1.400M17.300 17.300l1.400 1.400M5.300 18.700l1.400-1.400M17.300 6.700l1.400-1.400`,
  cloud: 'M7 19a4.500 4.500 0 0 1-.6-9A6 6 0 0 1 18 9.500a4.800 4.800 0 0 1-.5 9.500z',
  fish: 'M2.500 12c3-4.500 6-6 9.500-6s6 2.500 6.500 3.500L22 6.500v11l-3.500-3c-.5 1-3 3.500-6.500 3.500s-6.500-1.500-9.500-6zM8 11h.01',
  turtle: `M3 15a7.500 7.500 0 0 1 15 0zM6 15v3M15 15v3M7.500 15l3-7.500M13.500 15l-3-7.500M3 15l-1 1${o(20, 12.5, 2)}`,
  rain: 'M7 14.500a4 4 0 0 1-.5-8A5.500 5.500 0 0 1 17 6.500a4 4 0 0 1 0 8zM8 18l-1 3M12.500 18l-1 3M17 18l-1 3',
  bow: 'M8 3c6 4 6 14 0 18M8 3v18M3 12h18M18 9l3 3-3 3',
  bee: 'M12 8.500c3 0 5 3 5 6s-2.300 6-5 6-5-3-5-6 2-6 5-6zM7.500 13h9M7.800 17h8.400M10 8.800c-1.500-1.200-5.500-3-6.500-1.500s1.500 5 4 6M14 8.800c1.500-1.200 5.500-3 6.500-1.500s-1.500 5-4 6M10.500 8l-1-4M13.500 8l1-4',
  honey: 'M8 3.500h8v3H8zM7 6.500h10a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8.500a2 2 0 0 1 2-2zM12 10.500l3 1.700v3.500l-3 1.800-3-1.800v-3.500z',
  cake: 'M4 21v-8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8M2.500 21h19M4 15.500c1.300 1.300 2.700 1.300 4 0s2.700-1.300 4 0 2.700 1.300 4 0 2.700-1.300 4 0M12 11V7M12 3.500h.01',
  ice: 'M12 2.500l8.500 4.800v9.400L12 21.500l-8.500-4.800V7.300zM3.500 7.300 12 12l8.500-4.700M12 12v9.500',
  mountain: 'M2.500 20 9.500 6.500l4 7.500 2-3 6 9zM7 11.500 9.500 13l2-1.500',
  boat: 'M3 15h18l-2.500 5.500h-13zM11.500 15V3.500L5.500 12h6M13.500 6l5 6h-5',
  zongzi: 'M12 3.500 21 19.500H3zM8 11.500l8.500 8M16 11.500l-8.500 8',
};

const ICONS = { ...UI, ...GAME, ...ROOM, ...PICTURES };
const ICON_NAMES = Object.keys(ICONS);

function Icon({ name, size = 24, color = '#000', filled, strokeWidth = 1.8 }) {
  const d = ICONS[name];
  if (!d) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" pointerEvents="none">
      <Path d={d} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill={filled ? color : 'none'} />
    </Svg>
  );
}

exports.PICTURES = PICTURES;
exports.ICON_NAMES = ICON_NAMES;
exports.Icon = Icon;
});

// ---- components/ui
__d('components/ui', function (exports, __r) {
const React = E0.default;
const { useEffect, useRef, useState } = E0;
const { AccessibilityInfo, Animated, Platform, Pressable, ScrollView, Text, TextInput, View } = E1;
const { useSafeAreaInsets } = E3;
const { Icon } = __r('components/icons');
const { type, useColors } = __r('theme/tokens');

const NATIVE = Platform.OS !== 'web';

// Read once at module load so a component's very first frame already respects the setting.
let reducedNow = false;
const reducedListeners = new Set();
const setReducedNow = v => { reducedNow = !!v; reducedListeners.forEach(fn => fn(reducedNow)); };
AccessibilityInfo.isReduceMotionEnabled?.().then(setReducedNow).catch(() => {});
AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReducedNow);

function useReducedMotion() {
  const [reduced, setReduced] = useState(reducedNow);
  useEffect(() => {
    setReduced(reducedNow);
    reducedListeners.add(setReduced);
    return () => reducedListeners.delete(setReduced);
  }, []);
  return reduced;
}

// Apple's two spring parameters converted to stiffness/damping. Springs start from the
// value on screen, so every animation can be interrupted and retargeted mid-flight.
function spring(value, toValue, { response = 0.35, ratio = 1, reduced = false } = {}) {
  if (reduced) { value.setValue(toValue); return; }
  const w = (2 * Math.PI) / response;
  Animated.spring(value, { toValue, stiffness: w * w, damping: 2 * ratio * w, mass: 1, useNativeDriver: NATIVE }).start();
}

function T({ v = 'body', color, style, children, ...rest }) {
  const c = useColors();
  return <Text style={[type[v], { color: color || c.label }, style]} {...rest}>{children}</Text>;
}

// A flat card that gives way under the finger. Selection adds a heavier outline, so it is never colour alone.
function Tile({ onPress, selected, radius = 16, style, faceStyle, disabled, label, children }) {
  const c = useColors();
  const reduced = useReducedMotion();
  const s = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      accessibilityRole="button" accessibilityLabel={label}
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      disabled={disabled} delayPressIn={0} onPress={onPress}
      onPressIn={() => spring(s, 0.96, { response: 0.14, reduced })}
      onPressOut={() => spring(s, 1, { response: 0.3, reduced })}
      style={style}
    >
      <Animated.View style={[{
        flex: 1, borderRadius: radius, backgroundColor: selected ? c.accentTint : c.surface,
        borderWidth: selected ? 2 : 1, borderColor: selected ? c.accent : c.edge, opacity: disabled ? 0.5 : 1,
        alignItems: 'center', justifyContent: 'center', transform: [{ scale: s }],
      }, faceStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

// An icon on a soft rounded square: the one way a game, room or category is pictured.
function Badge({ icon, tone = 'puzzle', size = 44 }) {
  const c = useColors();
  const [bg, fg] = { puzzle: [c.puzzleTint, c.puzzle], challenge: [c.challengeTint, c.challenge], neutral: [c.surface2, c.secondary] }[tone];
  return (
    <View style={{ width: size, height: size, borderRadius: Math.round(size * 0.3), backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={Math.round(size * 0.56)} color={fg} />
    </View>
  );
}

function Button({ title, onPress, kind = 'primary', icon, disabled, style }) {
  const c = useColors();
  const reduced = useReducedMotion();
  const s = useRef(new Animated.Value(1)).current;
  const primary = kind === 'primary';
  const fg = primary ? c.onAccent : c.accent;
  return (
    <Pressable
      accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} delayPressIn={0} onPress={onPress}
      onPressIn={() => spring(s, 0.97, { response: 0.14, reduced })}
      onPressOut={() => spring(s, 1, { response: 0.3, reduced })} style={style}
    >
      <Animated.View style={{
        minHeight: 52, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', gap: 8,
        alignItems: 'center', justifyContent: 'center', backgroundColor: primary ? c.accent : c.accentTint,
        opacity: disabled ? 0.45 : 1, transform: [{ scale: s }],
      }}>
        {icon && <Icon name={icon} size={20} color={fg} strokeWidth={2} />}
        <T v="headline" color={fg} style={{ textAlign: 'center' }}>{title}</T>
      </Animated.View>
    </Pressable>
  );
}

function IconButton({ icon, label, onPress, color, filled }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={6}
      style={({ pressed }) => ({ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.5 : 1 })}>
      <Icon name={icon} size={24} color={color || c.accent} filled={filled} />
    </Pressable>
  );
}

function NavBar({ title, backLabel, onBack, right }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, backgroundColor: c.bg }}>
      <View style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          {onBack && (
            <Pressable accessibilityRole="button" accessibilityLabel={backLabel} onPress={onBack} hitSlop={6}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingRight: 8, opacity: pressed ? 0.5 : 1 })}>
              <Icon name="chevronLeft" size={24} color={c.accent} strokeWidth={2} />
              <T v="body" color={c.accent} numberOfLines={1}>{backLabel}</T>
            </Pressable>
          )}
        </View>
        <T v="headline" numberOfLines={1} accessibilityRole="header" style={{ flex: 2, textAlign: 'center' }}>{title}</T>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>{right}</View>
      </View>
    </View>
  );
}

// Forward screens arrive from the right, returning screens from the left: same path both ways.
function ScreenEnter({ dir = 0, children }) {
  const reduced = useReducedMotion();
  const o = useRef(new Animated.Value(dir ? 0 : 1)).current;
  const x = useRef(new Animated.Value(dir * 28)).current;
  useEffect(() => {
    spring(o, 1, { response: 0.3 });
    spring(x, 0, { response: 0.38, reduced });
  }, []);
  return <Animated.View style={{ flex: 1, opacity: o, transform: [{ translateX: reduced ? 0 : x }] }}>{children}</Animated.View>;
}

// Inline feedback replaces Alert.alert, which interrupts play and does nothing on web.
function Banner({ tone = 'info', text }) {
  const c = useColors();
  const reduced = useReducedMotion();
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => { a.setValue(0); spring(a, 1, { response: 0.32, ratio: tone === 'success' ? 0.75 : 1, reduced }); }, [text]);
  const map = {
    success: [c.successTint, c.success, 'checkCircle'],
    error: [c.dangerTint, c.danger, 'alertCircle'],
    info: [c.accentTint, c.accent, 'infoCircle'],
  }[tone];
  return (
    <Animated.View accessibilityLiveRegion="polite" style={{
      flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: map[0], borderRadius: 14, padding: 12, marginTop: 14,
      opacity: a, transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }],
    }}>
      <Icon name={map[2]} size={20} color={map[1]} strokeWidth={2} />
      <T v="subhead" color={map[1]} style={{ flex: 1, fontWeight: '600' }}>{text}</T>
    </Animated.View>
  );
}

function Segmented({ items, value, onChange }) {
  const c = useColors();
  const reduced = useReducedMotion();
  const [w, setW] = useState(0);
  const index = Math.max(0, items.findIndex(i => i.id === value));
  const x = useRef(new Animated.Value(0)).current;
  const seg = w / items.length;
  useEffect(() => { if (w) spring(x, index * seg, { reduced }); }, [index, w]);
  return (
    <View onLayout={e => setW(e.nativeEvent.layout.width - 8)} accessibilityRole="tablist"
      style={{ flexDirection: 'row', backgroundColor: c.surface2, borderRadius: 12, padding: 4 }}>
      {w > 0 && <Animated.View style={{ position: 'absolute', top: 4, bottom: 4, left: 4, width: seg, borderRadius: 9, backgroundColor: c.surface, transform: [{ translateX: x }] }} />}
      {items.map(i => (
        <Pressable key={i.id} accessibilityRole="tab" accessibilityState={{ selected: i.id === value }} onPress={() => onChange(i.id)}
          style={{ flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center' }}>
          <T v="subhead" color={i.id === value ? c.label : c.secondary} style={{ fontWeight: i.id === value ? '600' : '400' }}>{i.label}</T>
        </Pressable>
      ))}
    </View>
  );
}

function Group({ children, style }) {
  const c = useColors();
  return <View style={[{ backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.edge, overflow: 'hidden' }, style]}>{children}</View>;
}

// `accessory` sits beside the row's button, never inside it, so it stays its own control.
function Row({ leading, title, subtitle, trailing, accessory, onPress, last, label }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: accessory ? 4 : 0, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.separator }}>
      <Pressable accessibilityRole={onPress ? 'button' : undefined} accessibilityLabel={label} onPress={onPress} disabled={!onPress}
        style={({ pressed }) => ({ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingLeft: 14, paddingRight: accessory ? 4 : 16, paddingVertical: 10, backgroundColor: pressed ? c.surface2 : 'transparent' })}>
        {leading}
        <View style={{ flex: 1 }}>
          <T v="body" style={{ fontWeight: '500' }}>{title}</T>
          {!!subtitle && <T v="footnote" color={c.secondary}>{subtitle}</T>}
        </View>
        {trailing}
        {onPress && !accessory && <Icon name="chevronRight" size={18} color={c.placeholder} />}
      </Pressable>
      {accessory}
    </View>
  );
}

const Field = React.forwardRef(function Field({ style, ...props }, ref) {
  const c = useColors();
  return <TextInput ref={ref} placeholderTextColor={c.placeholder} style={[type.body, { color: c.label, minHeight: 48, paddingVertical: 10 }, !NATIVE && { outlineColor: c.accent }, style]} {...props} />;
});

function Section({ title, children, style }) {
  return (
    <View style={[{ marginTop: 26 }, style]}>
      <T v="title2" accessibilityRole="header" style={{ marginBottom: 12 }}>{title}</T>
      {children}
    </View>
  );
}

function Page({ children, bottom = 32, scrollRef, ...rest }) {
  return (
    <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" {...rest}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: bottom, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
      {children}
    </ScrollView>
  );
}

function Chip({ text, tone = 'neutral' }) {
  const c = useColors();
  const [bg, fg] = tone === 'accent' ? [c.accentTint, c.accent] : [c.surface2, c.secondary];
  return <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }}><T v="caption" color={fg}>{text}</T></View>;
}

function EmptyState({ icon, title, body, children }) {
  const c = useColors();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 12 }}>
      <Badge icon={icon} tone="neutral" size={72} />
      <T v="title2" style={{ marginTop: 14, textAlign: 'center' }}>{title}</T>
      {!!body && <T v="subhead" color={c.secondary} style={{ marginTop: 6, textAlign: 'center' }}>{body}</T>}
      {children && <View style={{ marginTop: 18, alignSelf: 'stretch' }}>{children}</View>}
    </View>
  );
}

exports.useReducedMotion = useReducedMotion;
exports.spring = spring;
exports.T = T;
exports.Tile = Tile;
exports.Badge = Badge;
exports.Button = Button;
exports.IconButton = IconButton;
exports.NavBar = NavBar;
exports.ScreenEnter = ScreenEnter;
exports.Banner = Banner;
exports.Segmented = Segmented;
exports.Group = Group;
exports.Row = Row;
exports.Field = Field;
exports.Section = Section;
exports.Page = Page;
exports.Chip = Chip;
exports.EmptyState = EmptyState;
});

// ---- config
__d('config', function (exports, __r) {
// Snack has no .env file. To use accounts, favourites sync and chat, put your deployed API address here
// (for example 'https://play.example.com'). Left empty, the app runs on this device only.
const API_URL = '';

exports.API_URL = API_URL;
});

// ---- data/rooms
__d('data/rooms', function (exports, __r) {
const ROOMS = [
  { id: 'superpower', icon: 'shield', zh: '如果可以擁有一種超能力，你會選什麼？', en: 'If you could have one superpower, what would it be?' },
  { id: 'freeday', icon: 'sofa', zh: '如果明天不用上課或上班，你最想做什麼？', en: 'What would you do if you had a free day tomorrow?' },
  { id: 'friendship', icon: 'people', zh: '你覺得友情中最重要的是什麼？', en: 'What matters most in a friendship?' },
  { id: 'travel', icon: 'plane', zh: '如果能去世界任何一個地方，你想去哪裡？', en: 'Where would you go if you could visit anywhere?' },
];

exports.ROOMS = ROOMS;
});

// ---- games/catalog
__d('games/catalog', function (exports, __r) {
const AsyncStorage = E5.default;
const { PICTURES } = __r('components/icons');
const { api } = __r('lib/api');

const g = (id, type, zh, en, icon, secs, kind, dz, de, extra = {}) => ({ id, type, zh, en, icon, secs, kind, dz, de, ...extra });

const GAMES = [
  g('sudoku', 'puzzle', '迷你數獨', 'Mini Sudoku', 'grid', 90, 'sudoku', '每列每行 1～4 不重複', 'No repeats in any row or column'),
  g('wordsearch', 'puzzle', '找字遊戲', 'Word Search', 'letters', 60, 'wordsearch', '依序點出藏起來的單字', 'Tap the hidden word in order'),
  g('finddiff', 'puzzle', '找不同', 'Spot the Odd', 'search', 45, 'finddiff', '一眼抓出不一樣的圖案', 'Find the one that differs'),
  g('matchstick', 'puzzle', '火柴棒謎題', 'Matchsticks', 'match', 90, 'matchstick', '移動一根，算式就成立', 'Move one stick to fix the sum'),
  g('slide', 'puzzle', '數字拼圖', 'Sliding Tiles', 'tiles', 120, 'slide', '把數字滑回 1～8', 'Slide the tiles back to 1–8'),
  g('memory', 'puzzle', '記憶配對', 'Memory Match', 'cards', 90, 'memory', '翻牌找出所有配對', 'Flip cards to find every pair'),
  g('rebus', 'puzzle', '圖像猜謎', 'Picture Rebus', 'bulb', 90, 'quiz', '看圖示猜答案', 'Guess the answer from pictures', { ai: 'rebus' }),
  g('maze', 'puzzle', '迷宮', 'Maze', 'maze', 60, 'maze', '每次都是新迷宮', 'A brand-new maze every time'),
  g('logic', 'puzzle', '邏輯推理', 'Logic Puzzles', 'branch', 120, 'quiz', '短短幾句，推出答案', 'Short clues, one conclusion', { ai: 'logic' }),
  g('g2048', 'puzzle', '數字合成', '2048 Sprint', 'merge', 180, 'g2048', '三分鐘衝最高分', 'Highest score in three minutes'),
  g('quizrush', 'challenge', '快問快答', 'Quiz Rush', 'flash', 45, 'quiz', '45 秒答越多越好', 'Answer fast for 45 seconds', { ai: 'quiz', limit: 45 }),
  g('truefalse', 'challenge', '是非搶答', 'True or False', 'truefalse', 30, 'quiz', '30 秒判斷真假', 'Call it in 30 seconds', { ai: 'truefalse', limit: 30 }),
  g('idiom', 'challenge', '成語填空', 'Proverb Fill', 'scroll', 45, 'quiz', '補上缺的那個字', 'Fill in the missing word', { ai: 'idiom', limit: 45 }),
  g('riddle', 'challenge', '謎語衝刺', 'Riddle Dash', 'question', 60, 'quiz', '腦筋急轉彎限時版', 'Brain teasers against the clock', { ai: 'riddle', limit: 60 }),
  g('oddone', 'challenge', '誰是異類', 'Odd One Out', 'eye', 45, 'quiz', '選出不屬於同類的', 'Pick what does not belong', { ai: 'oddone', limit: 45 }),
  g('mental', 'challenge', '心算衝刺', 'Mental Math', 'calc', 45, 'mental', '45 秒連續心算', 'Rapid sums for 45 seconds'),
  g('stroop', 'challenge', '顏色陷阱', 'Colour Trap', 'palette', 30, 'stroop', '選字的顏色，不是字義', 'Pick the ink, not the word'),
  g('reaction', 'challenge', '反應力', 'Reaction', 'stoplight', 30, 'reaction', '看到提示立刻按', 'Tap the moment it says go'),
  g('schulte', 'challenge', '數字追擊', 'Number Chase', 'speed', 40, 'schulte', '照順序點完 1～16', 'Tap 1 to 16 in order'),
  g('simon', 'challenge', '記憶序列', 'Sequence', 'music', 60, 'simon', '跟著亮燈順序按', 'Repeat the growing sequence'),
];
const gameById = id => GAMES.find(x => x.id === id);
const shuffle = a => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

const q = (zp, ep, zo, eo, answer, icons) => ({ zh: { prompt: zp, options: zo, answer, icons }, en: { prompt: ep, options: eo, answer, icons } });
const TF = [['對', '錯'], ['True', 'False']];
const tf = (zp, ep, yes) => q(zp, ep, TF[0], TF[1], yes ? 0 : 1);

const BUILTIN = {
  rebus: [
    q('猜天氣現象', 'Guess the weather', ['彩虹', '颱風', '閃電', '下雪'], ['Rainbow', 'Typhoon', 'Lightning', 'Snow'], 0, ['rain', 'bow']),
    q('猜甜食來源', 'Guess the food', ['蜂蜜', '果醬', '砂糖', '巧克力'], ['Honey', 'Jam', 'Sugar', 'Chocolate'], 0, ['bee', 'honey']),
    q('猜節慶', 'Guess the festival', ['中秋節', '端午節', '元宵節', '清明節'], ['Mid-Autumn', 'Dragon Boat', 'Lantern', 'Qingming'], 0, ['moon', 'cake']),
    q('猜地形', 'Guess the landform', ['冰川', '沙漠', '火山', '草原'], ['Glacier', 'Desert', 'Volcano', 'Prairie'], 0, ['ice', 'mountain']),
    q('猜節慶', 'Guess the festival', ['端午節', '春節', '中秋節', '重陽節'], ['Dragon Boat', 'Lunar New Year', 'Mid-Autumn', 'Double Ninth'], 0, ['zongzi', 'boat']),
  ],
  logic: [
    q('小明比小華高，小華比小美高。誰最矮？', 'Al is taller than Bo, Bo is taller than Cy. Who is shortest?', ['小美', '小華', '小明', '無法判斷'], ['Cy', 'Bo', 'Al', 'Cannot tell'], 0),
    q('所有貓都是動物，咪咪是貓。所以？', 'All cats are animals. Mimi is a cat. So?', ['咪咪是動物', '動物都是貓', '咪咪不是動物', '無法判斷'], ['Mimi is an animal', 'All animals are cats', 'Mimi is not an animal', 'Cannot tell'], 0),
    q('2、4、8、16，下一個數字？', '2, 4, 8, 16, what comes next?', ['32', '24', '20', '18'], ['32', '24', '20', '18'], 0),
    q('今天星期三，再過 10 天是星期幾？', 'Today is Wednesday. What day is it in 10 days?', ['星期六', '星期五', '星期日', '星期一'], ['Saturday', 'Friday', 'Sunday', 'Monday'], 0),
    q('三人排隊，甲不在最前，乙在最後。誰在最前？', 'Three queue. A is not first, B is last. Who is first?', ['丙', '甲', '乙', '無法判斷'], ['C', 'A', 'B', 'Cannot tell'], 0),
  ],
  quiz: [
    q('太陽系最大的行星？', 'Largest planet in the solar system?', ['木星', '土星', '地球', '海王星'], ['Jupiter', 'Saturn', 'Earth', 'Neptune'], 0),
    q('水的化學式？', 'Chemical formula of water?', ['H₂O', 'CO₂', 'O₂', 'NaCl'], ['H₂O', 'CO₂', 'O₂', 'NaCl'], 0),
    q('一年有幾個季節？', 'How many seasons in a year?', ['4', '3', '5', '6'], ['4', '3', '5', '6'], 0),
    q('彩虹通常有幾種顏色？', 'How many colours in a rainbow?', ['7', '5', '6', '8'], ['7', '5', '6', '8'], 0),
    q('世界最高的山峰？', 'World\'s highest mountain?', ['聖母峰', '玉山', '富士山', 'K2'], ['Everest', 'Yushan', 'Fuji', 'K2'], 0),
  ],
  truefalse: [
    tf('章魚有三顆心臟。', 'An octopus has three hearts.', true),
    tf('聲音在真空中傳得最快。', 'Sound travels fastest in a vacuum.', false),
    tf('香蕉在植物學上屬於漿果。', 'Botanically, a banana is a berry.', true),
    tf('金星是離太陽最近的行星。', 'Venus is the closest planet to the Sun.', false),
    tf('人體最大的器官是皮膚。', 'Skin is the largest human organ.', true),
  ],
  idiom: [
    q('一石二＿', 'Kill two birds with one ＿', ['鳥', '魚', '馬', '虎'], ['stone', 'stick', 'arrow', 'hand'], 0),
    q('畫蛇添＿', 'A picture is worth a thousand ＿', ['足', '翼', '尾', '角'], ['words', 'coins', 'days', 'lines'], 0),
    q('守株待＿', 'The early bird catches the ＿', ['兔', '鹿', '羊', '鳥'], ['worm', 'fish', 'cat', 'seed'], 0),
    q('對牛彈＿', 'Don\'t cry over spilled ＿', ['琴', '笛', '鼓', '歌'], ['milk', 'tea', 'wine', 'water'], 0),
    q('亡羊補＿', 'Better late than ＿', ['牢', '門', '牆', '網'], ['never', 'sorry', 'early', 'ever'], 0),
  ],
  riddle: [
    q('什麼東西越洗越髒？', 'What gets wetter the more it dries?', ['水', '衣服', '碗', '手'], ['A towel', 'A river', 'A cup', 'Rain'], 0),
    q('什麼東西有腳卻不會走？', 'What has legs but cannot walk?', ['桌子', '小狗', '小鳥', '螞蟻'], ['A table', 'A dog', 'A bird', 'An ant'], 0),
    q('什麼門永遠關不上？', 'What has keys but opens no locks?', ['球門', '大門', '車門', '房門'], ['A piano', 'A door', 'A safe', 'A car'], 0),
    q('什麼東西有很多牙齒卻不會咬人？', 'What has many teeth but cannot bite?', ['梳子', '老虎', '鯊魚', '恐龍'], ['A comb', 'A tiger', 'A shark', 'A dinosaur'], 0),
    q('什麼東西你用得越多，它就越小？', 'What gets smaller the more you use it?', ['肥皂', '書本', '手機', '鞋子'], ['Soap', 'A book', 'A phone', 'A shoe'], 0),
  ],
  oddone: [
    q('哪個不是水果？', 'Which is not a fruit?', ['高麗菜', '蘋果', '香蕉', '葡萄'], ['Cabbage', 'Apple', 'Banana', 'Grape'], 0),
    q('哪個不是哺乳類？', 'Which is not a mammal?', ['鱷魚', '鯨魚', '蝙蝠', '海豚'], ['Crocodile', 'Whale', 'Bat', 'Dolphin'], 0),
    q('哪個不是樂器？', 'Which is not an instrument?', ['書桌', '鋼琴', '小提琴', '吉他'], ['Desk', 'Piano', 'Violin', 'Guitar'], 0),
    q('哪個不是行星？', 'Which is not a planet?', ['月球', '火星', '金星', '土星'], ['The Moon', 'Mars', 'Venus', 'Saturn'], 0),
    q('哪個不是交通工具？', 'Which is not a vehicle?', ['雨傘', '公車', '火車', '腳踏車'], ['Umbrella', 'Bus', 'Train', 'Bicycle'], 0),
  ],
};
const BUILTIN_WORDS = [['CAT', '貓', 'A pet that purrs'], ['MOON', '月亮', 'It orbits Earth'], ['APPLE', '蘋果', 'A crunchy fruit'], ['RIVER', '河流', 'Flowing water'], ['TIGER', '老虎', 'A striped big cat'], ['BREAD', '麵包', 'Baked at breakfast']];
const PICTURE_PAIRS = [['dog', 'cat'], ['star', 'moon'], ['apple', 'pear'], ['car', 'bike'], ['sun', 'cloud'], ['fish', 'turtle']];
const MEMORY_SET = [
  { icon: 'pizza', zh: '披薩', en: 'Pizza' }, { icon: 'panda', zh: '貓熊', en: 'Panda' }, { icon: 'rocket', zh: '火箭', en: 'Rocket' },
  { icon: 'guitar', zh: '吉他', en: 'Guitar' }, { icon: 'cactus', zh: '仙人掌', en: 'Cactus' }, { icon: 'fox', zh: '狐狸', en: 'Fox' },
  { icon: 'donut', zh: '甜甜圈', en: 'Donut' }, { icon: 'ball', zh: '足球', en: 'Football' }, { icon: 'rainbow', zh: '彩虹', en: 'Rainbow' },
  { icon: 'balloon', zh: '氣球', en: 'Balloon' }, { icon: 'watermelon', zh: '西瓜', en: 'Watermelon' }, { icon: 'star', zh: '星星', en: 'Star' },
];

const shuffleOptions = x => {
  const correct = x.options[x.answer];
  const options = shuffle(x.options);
  return { prompt: x.prompt, icons: x.icons, options, answer: options.indexOf(correct) };
};
const questionKey = x => [x.prompt, ...(x.icons || [])].join(' ');

async function seen(id) { try { return JSON.parse(await AsyncStorage.getItem(`seen:${id}`)) || []; } catch { return []; } }
async function remember(id, items) { try { await AsyncStorage.setItem(`seen:${id}`, JSON.stringify([...items, ...(await seen(id))].slice(0, 40))); } catch {} }

// The server waits up to 12 seconds on Gemini, so this only trips if the server itself stalls.
const TIMEOUT_MS = 15000;
const ask = (kind, lang, avoid) => api(`/questions/${kind}`, { method: 'POST', body: { lang, avoid: avoid.slice(0, 20) }, timeoutMs: TIMEOUT_MS });

// Returns { items, source }. Any failure falls back to the built-in bank so play never stalls.
async function loadQuiz(game, lang) {
  const avoid = await seen(game.id);
  try {
    const { questions } = await ask(game.ai, lang, avoid);
    const items = questions.filter(x => !x.icons || x.icons.every(n => PICTURES[n])).filter(x => !avoid.includes(questionKey(x)));
    if (items.length >= 3) { remember(game.id, items.map(questionKey)); return { items: items.map(shuffleOptions), source: 'gemini' }; }
  } catch (e) { console.warn('Fresh questions unavailable:', e.message); }
  return { items: shuffle(BUILTIN[game.ai]).map(x => shuffleOptions(x[lang])), source: 'builtin' };
}

async function loadWords(lang, count = 3) {
  try {
    const avoid = await seen('wordsearch');
    const { words } = await ask('words', lang, avoid);
    const items = words.filter(w => !avoid.includes(w.word));
    if (items.length >= count) { remember('wordsearch', items.map(i => i.word)); return { items: items.slice(0, count), source: 'gemini' }; }
  } catch (e) { console.warn('Fresh words unavailable:', e.message); }
  return { items: shuffle(BUILTIN_WORDS).slice(0, count).map(([word, z, e]) => ({ word, hint: lang === 'zh' ? z : e })), source: 'builtin' };
}

// Pictures are drawn in-app, so these two games pick from local sets and need no network.
const loadPairs = async (count = 3) => ({ items: shuffle(PICTURE_PAIRS).slice(0, count) });
const loadMemorySet = async (count = 6) => ({ items: shuffle(MEMORY_SET).slice(0, count) });

exports.GAMES = GAMES;
exports.gameById = gameById;
exports.shuffle = shuffle;
exports.loadQuiz = loadQuiz;
exports.loadWords = loadWords;
exports.loadPairs = loadPairs;
exports.loadMemorySet = loadMemorySet;
});

// ---- games/views/FindDifferent
__d('games/views/FindDifferent', function (exports, __r) {
const React = E0.default;
const { useMemo, useState } = E0;
const { View } = E1;
const { Banner, T } = __r('components/ui');
const { useColors } = __r('theme/tokens');
const { Cell, Grid, randInt, useBoardSize } = __r('games/views/shared');

function FindDifferent({ tr, data, onFinish }) {
  const c = useColors();
  const size = useBoardSize();
  const [round, setRound] = useState(0);
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState(false);
  const odd = useMemo(() => randInt(16), [round]);
  const [base, other] = data.items[round];
  const tap = i => {
    if (i !== odd) { setMisses(misses + 1); setWrong(true); return; }
    setWrong(false);
    if (round + 1 === data.items.length) onFinish({ won: true, score: misses, lower: true, title: tr('眼力真好！', 'Sharp eyes!'), detail: misses ? tr(`點錯 ${misses} 次。`, `${misses} wrong taps.`) : tr('一次都沒點錯。', 'Not a single wrong tap.') });
    else setRound(round + 1);
  };
  return (
    <View>
      <T v="subhead" color={c.secondary} style={{ marginBottom: 14 }}>{tr(`第 ${round + 1} / ${data.items.length} 關：點出不一樣的那個`, `Round ${round + 1} of ${data.items.length}: tap the odd one`)}</T>
      <Grid n={4} size={size} render={i => <Cell icon={i === odd ? other : base} label={tr(`第 ${i + 1} 格`, `Cell ${i + 1}`)} onPress={() => tap(i)} />} />
      {wrong && <Banner tone="error" text={tr('不是這個，再找找。', 'Not that one. Keep looking.')} />}
    </View>
  );
}

exports.default = FindDifferent;
});

// ---- games/views/G2048
__d('games/views/G2048', function (exports, __r) {
const React = E0.default;
const { useMemo, useRef, useState } = E0;
const { PanResponder, View } = E1;
const { T } = __r('components/ui');
const { useColors } = __r('theme/tokens');
const { Pad, randInt, TimerBar, useArrowKeys, useBoardSize, useCountdown } = __r('games/views/shared');

const LIMIT = 180;
const spawn = b => { const e = b.map((v, i) => (v ? -1 : i)).filter(i => i >= 0); if (!e.length) return b; const n = [...b]; n[e[randInt(e.length)]] = Math.random() < 0.9 ? 2 : 4; return n; };
const slide = line => {
  const v = line.filter(Boolean); const out = []; let gain = 0;
  for (let i = 0; i < v.length; i++) { if (v[i] === v[i + 1]) { out.push(v[i] * 2); gain += v[i] * 2; i++; } else out.push(v[i]); }
  while (out.length < 4) out.push(0);
  return { out, gain };
};
const LINES = {
  left: [0, 1, 2, 3].map(r => [0, 1, 2, 3].map(c => r * 4 + c)),
  right: [0, 1, 2, 3].map(r => [3, 2, 1, 0].map(c => r * 4 + c)),
  up: [0, 1, 2, 3].map(c => [0, 1, 2, 3].map(r => r * 4 + c)),
  down: [0, 1, 2, 3].map(c => [3, 2, 1, 0].map(r => r * 4 + c)),
};
function apply(b, d) {
  const n = [...b]; let gain = 0;
  LINES[d].forEach(idx => { const s = slide(idx.map(i => b[i])); gain += s.gain; idx.forEach((i, k) => { n[i] = s.out[k]; }); });
  return { board: n, gain, moved: n.some((v, i) => v !== b[i]) };
}
const stuck = b => Object.keys(LINES).every(d => !apply(b, d).moved);

function G2048({ tr, onFinish }) {
  const c = useColors();
  const size = useBoardSize(340);
  const [board, setBoard] = useState(() => spawn(spawn(Array(16).fill(0))));
  const [score, setScore] = useState(0);
  const finished = useRef(false);
  const live = useRef({}); live.current = { board, score };
  const end = why => {
    if (finished.current) return; finished.current = true;
    const { board: b, score: s } = live.current; const best = Math.max(...b);
    onFinish({ won: best >= 128, score: s, title: tr(`${s} 分`, `${s} points`), detail: `${why} ${tr('最大方塊', 'Top tile')} ${best}` });
  };
  const left = useCountdown(LIMIT, () => end(tr('時間到。', "Time's up.")));
  const move = d => {
    if (finished.current) return;
    const { board: b, score: s } = live.current;
    const r = apply(b, d);
    if (!r.moved) return;
    const n = spawn(r.board);
    live.current = { board: n, score: s + r.gain };
    setBoard(n); setScore(s + r.gain);
    if (stuck(n)) end(tr('沒有步可走了。', 'No moves left.'));
  };
  const mv = useRef(move); mv.current = move;
  useArrowKeys(move);
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 10 || Math.abs(g.dy) > 10,
    onPanResponderRelease: (_, g) => { if (Math.max(Math.abs(g.dx), Math.abs(g.dy)) >= 20) mv.current(Math.abs(g.dx) > Math.abs(g.dy) ? (g.dx > 0 ? 'right' : 'left') : (g.dy > 0 ? 'down' : 'up')); },
  }), []);
  const gap = 8; const cell = (size - gap * 5) / 4;
  return (
    <View>
      <TimerBar left={left} total={LIMIT} score={score} scoreLabel={tr('得分', 'Score')} />
      <View {...pan.panHandlers} accessibilityLabel={tr(`棋盤，得分 ${score}`, `Board, score ${score}`)} style={{ width: size, alignSelf: 'center', padding: gap, gap, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: c.surface2, borderRadius: 14 }}>
        {board.map((v, i) => {
          const hot = v >= 64; const warm = v >= 8;
          return (
            <View key={i} style={{ width: cell, height: cell, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: !v ? c.bg : hot ? c.accent : warm ? c.accentTint : c.surface }}>
              {!!v && <T style={{ fontSize: v >= 1000 ? 20 : 26, lineHeight: 32, fontWeight: '700' }} color={hot ? c.onAccent : warm ? c.accent : c.label}>{v}</T>}
            </View>
          );
        })}
      </View>
      <Pad onMove={move} tr={tr} />
    </View>
  );
}

exports.default = G2048;
});

// ---- games/views/Matchstick
__d('games/views/Matchstick', function (exports, __r) {
const React = E0.default;
const { useMemo, useState } = E0;
const { View } = E1;
const { Banner, Button, T } = __r('components/ui');
const { shuffle } = __r('games/catalog');
const { useColors } = __r('theme/tokens');

// Seven-segment digits as bitmasks, segments a–g = bits 0–6.
const D = [0b0111111, 0b0000110, 0b1011011, 0b1001111, 0b1100110, 0b1101101, 0b1111101, 0b0000111, 0b1111111, 0b1101111];
const ALL_TRUE = [];
for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (const op of ['+', '-']) {
  const r = op === '+' ? a + b : a - b;
  if (r >= 0 && r < 10) ALL_TRUE.push({ a, op, b, r });
}
const isTrue = e => (e.op === '+' ? e.a + e.b : e.a - e.b) === e.r;
const str = e => `${e.a} ${e.op} ${e.b} = ${e.r}`;

// Every equation reachable by moving exactly one stick between (or within) digits.
function neighbours(e) {
  const v = [e.a, e.b, e.r];
  const out = [];
  for (let i = 0; i < 3; i++) for (let s = 0; s < 7; s++) {
    if (!(D[v[i]] >> s & 1)) continue;
    for (let j = 0; j < 3; j++) for (let t = 0; t < 7; t++) {
      const from = D[v[i]] & ~(1 << s);
      const base = i === j ? from : D[v[j]];
      if (base >> t & 1 || (i === j && t === s)) continue;
      const to = base | (1 << t);
      const nv = [...v];
      if (i === j) { const d = D.indexOf(to); if (d < 0) continue; nv[i] = d; } else {
        const di = D.indexOf(from); const dj = D.indexOf(to);
        if (di < 0 || dj < 0) continue;
        nv[i] = di; nv[j] = dj;
      }
      out.push({ a: nv[0], op: e.op, b: nv[1], r: nv[2] });
    }
  }
  return out;
}

function makePuzzle() {
  for (const answer of shuffle(ALL_TRUE)) {
    const wrong = shuffle(neighbours(answer)).find(x => !isTrue(x));
    if (!wrong) continue;
    const reach = new Set(neighbours(wrong).map(str));
    const others = shuffle(ALL_TRUE).filter(x => !reach.has(str(x))).slice(0, 3);
    if (others.length < 3) continue;
    return { wrong, answer, options: shuffle([answer, ...others]) };
  }
  throw new Error('no matchstick puzzle');
}

const POS = [[1, 0, 1], [2, 1, 0], [2, 3, 0], [1, 4, 1], [0, 3, 0], [0, 1, 0], [1, 2, 1]]; // col, row-ish, horizontal
function Digit({ d, color }) {
  const U = 12; const L = 3 * U; const W = 6;
  return (
    <View style={{ width: L + W, height: 2 * L + W }}>
      {POS.map(([col, row, h], s) => (D[d] >> s & 1 ? (
        <View key={s} style={{ position: 'absolute', backgroundColor: color, borderRadius: 3,
          left: col === 1 ? W / 2 + 1 : col === 2 ? L : 0,
          top: h ? (row / 2) * L : row === 1 ? W / 2 + 1 : L + W / 2 + 1,
          width: h ? L - 2 : W, height: h ? W : L - 2 }} />
      ) : null))}
    </View>
  );
}

function Matchstick({ tr, onFinish }) {
  const c = useColors();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [pick, setPick] = useState(null);
  const [fb, setFb] = useState(null);
  const p = useMemo(makePuzzle, [round]);
  const total = 3;
  const check = () => {
    const right = str(pick) === str(p.answer);
    if (fb) {
      const s = score;
      if (round + 1 === total) onFinish({ won: s >= 2, score: s, title: tr(`答對 ${s} / ${total} 題`, `${s} of ${total} right`), detail: s >= 2 ? tr('火柴棒難不倒你。', 'Matchsticks are no match for you.') : tr('再來一局，題目會換。', 'Go again for new puzzles.') });
      else { setRound(round + 1); setPick(null); setFb(null); }
      return;
    }
    if (right) setScore(score + 1);
    setFb(right ? 'right' : 'wrong');
  };
  return (
    <View>
      <T v="subhead" color={c.secondary}>{tr(`第 ${round + 1} / ${total} 題：只移動一根火柴，算式會變成哪一個？`, `Puzzle ${round + 1} of ${total}: move one stick. Which equation can it become?`)}</T>
      <View accessibilityLabel={str(p.wrong)} accessible style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginVertical: 22 }}>
        <Digit d={p.wrong.a} color={c.challenge} /><T v="title">{p.wrong.op}</T><Digit d={p.wrong.b} color={c.challenge} /><T v="title">=</T><Digit d={p.wrong.r} color={c.challenge} />
      </View>
      <View style={{ gap: 8 }}>
        {p.options.map(o => (
          <Button key={str(o)} kind={pick && str(pick) === str(o) ? 'primary' : 'secondary'} title={str(o)} disabled={!!fb} onPress={() => setPick(o)} />
        ))}
      </View>
      {fb && <Banner tone={fb === 'right' ? 'success' : 'error'} text={fb === 'right' ? tr('答對了！', 'Correct!') : tr(`答案是 ${str(p.answer)}`, `It was ${str(p.answer)}`)} />}
      <Button style={{ marginTop: 16 }} disabled={!pick} title={fb ? tr('下一題', 'Next') : tr('確認答案', 'Check')} onPress={check} />
    </View>
  );
}

exports.default = Matchstick;
exports.makePuzzle = makePuzzle;
});

// ---- games/views/Maze
__d('games/views/Maze', function (exports, __r) {
const React = E0.default;
const { useEffect, useMemo, useRef, useState } = E0;
const { Animated, View } = E1;
const { Icon } = __r('components/icons');
const { spring, T, useReducedMotion } = __r('components/ui');
const { shuffle } = __r('games/catalog');
const { useColors } = __r('theme/tokens');
const { Pad, useArrowKeys, useBoardSize } = __r('games/views/shared');

const N = 8;
const DIRS = { up: [-1, 0, 'n', 's'], down: [1, 0, 's', 'n'], left: [0, -1, 'w', 'e'], right: [0, 1, 'e', 'w'] };
function generate() {
  const cells = Array.from({ length: N * N }, () => ({ n: true, s: true, e: true, w: true, seen: false }));
  const stack = [0]; cells[0].seen = true;
  while (stack.length) {
    const cur = stack[stack.length - 1];
    const r = Math.floor(cur / N); const col = cur % N;
    const next = shuffle(Object.values(DIRS)).map(([dr, dc, a, b]) => ({ r: r + dr, c: col + dc, a, b })).find(o => o.r >= 0 && o.r < N && o.c >= 0 && o.c < N && !cells[o.r * N + o.c].seen);
    if (!next) { stack.pop(); continue; }
    const k = next.r * N + next.c;
    cells[cur][next.a] = false; cells[k][next.b] = false; cells[k].seen = true; stack.push(k);
  }
  return cells;
}

function Maze({ tr, onFinish }) {
  const c = useColors();
  const reduced = useReducedMotion();
  const size = useBoardSize(340);
  const cell = size / N;
  const cells = useMemo(generate, []);
  const [pos, setPos] = useState(0);
  const [steps, setSteps] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => { spring(x, (pos % N) * cell, { response: 0.22, reduced }); spring(y, Math.floor(pos / N) * cell, { response: 0.22, reduced }); }, [pos, cell]);
  const done = useRef(false);
  const move = d => {
    const [dr, dc, wall] = DIRS[d];
    if (done.current || cells[pos][wall]) return;
    const np = pos + dr * N + dc;
    setPos(np); setSteps(steps + 1);
    if (np === N * N - 1) { done.current = true; setTimeout(() => onFinish({ won: true, score: steps + 1, lower: true, title: tr('走出來了！', 'You made it out!'), detail: tr(`走了 ${steps + 1} 步。`, `${steps + 1} steps.`) }), 300); }
  };
  useArrowKeys(move);
  return (
    <View>
      <T v="subhead" color={c.secondary} style={{ marginBottom: 14 }}>{tr('從左上走到右下的旗子。', 'Get from the top left to the flag.')}</T>
      <View accessibilityLabel={tr(`迷宮，已走 ${steps} 步`, `Maze, ${steps} steps taken`)} style={{ width: size, height: size, alignSelf: 'center', backgroundColor: c.surface, flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((w, i) => (
          <View key={i} style={{ width: cell, height: cell, borderColor: c.label, borderTopWidth: w.n ? 2 : 0, borderBottomWidth: w.s ? 2 : 0, borderLeftWidth: w.w ? 2 : 0, borderRightWidth: w.e ? 2 : 0, alignItems: 'center', justifyContent: 'center' }}>
            {i === N * N - 1 && <Icon name="flag" size={cell * 0.6} color={c.accent} strokeWidth={2} />}
          </View>
        ))}
        <Animated.View pointerEvents="none" style={{ position: 'absolute', width: cell, height: cell, alignItems: 'center', justifyContent: 'center', transform: [{ translateX: x }, { translateY: y }] }}>
          <View style={{ width: cell * 0.55, height: cell * 0.55, borderRadius: cell, backgroundColor: c.accent }} />
        </Animated.View>
      </View>
      <Pad onMove={move} tr={tr} />
    </View>
  );
}

exports.default = Maze;
});

// ---- games/views/Memory
__d('games/views/Memory', function (exports, __r) {
const React = E0.default;
const { useEffect, useMemo, useRef, useState } = E0;
const { View } = E1;
const { T } = __r('components/ui');
const { shuffle } = __r('games/catalog');
const { useColors } = __r('theme/tokens');
const { Cell, Grid, useBoardSize } = __r('games/views/shared');

function Memory({ tr, data, onFinish }) {
  const c = useColors();
  const size = useBoardSize();
  const cards = useMemo(() => shuffle([...data.items, ...data.items]), [data]);
  const [open, setOpen] = useState([]);
  const [done, setDone] = useState([]);
  const [moves, setMoves] = useState(0);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const tap = i => {
    if (done.includes(i) || open.includes(i)) return;
    clearTimeout(timer.current);
    if (open.length !== 1) { setOpen([i]); return; }
    const pair = [open[0], i];
    setOpen(pair); setMoves(moves + 1);
    if (cards[pair[0]].icon === cards[pair[1]].icon) {
      const nd = [...done, ...pair];
      setDone(nd); setOpen([]);
      if (nd.length === cards.length) onFinish({ won: true, score: moves + 1, lower: true, title: tr('全部配對成功！', 'All matched!'), detail: tr(`翻了 ${moves + 1} 次。`, `${moves + 1} turns.`) });
    } else {
      timer.current = setTimeout(() => setOpen([]), 800);
    }
  };
  return (
    <View>
      <T v="subhead" color={c.secondary} style={{ marginBottom: 14 }}>{tr(`翻牌找出所有配對。已翻 ${moves} 次`, `Find every pair. ${moves} turns`)}</T>
      <Grid n={4} count={cards.length} size={size} render={i => {
        const up = open.includes(i) || done.includes(i);
        return <Cell icon={up ? cards[i].icon : undefined} text={up ? undefined : '?'} muted={!up} disabled={done.includes(i)} label={up ? tr(cards[i].zh, cards[i].en) : tr(`第 ${i + 1} 張牌`, `Card ${i + 1}`)} onPress={() => tap(i)} />;
      }} />
    </View>
  );
}

exports.default = Memory;
});

// ---- games/views/Mental
__d('games/views/Mental', function (exports, __r) {
const React = E0.default;
const { useMemo, useRef, useState } = E0;
const { View } = E1;
const { Button, T } = __r('components/ui');
const { shuffle } = __r('games/catalog');
const { randInt, TimerBar, useCountdown } = __r('games/views/shared');

const LIMIT = 45;
function make() {
  const op = ['+', '-', '×'][randInt(3)];
  let a; let b; let r;
  if (op === '×') { a = 2 + randInt(8); b = 2 + randInt(8); r = a * b; }
  else if (op === '+') { a = 5 + randInt(45); b = 5 + randInt(45); r = a + b; }
  else { a = 20 + randInt(60); b = 1 + randInt(a - 1); r = a - b; }
  const opts = new Set([r]);
  while (opts.size < 4) { const d = r + (randInt(2) ? 1 : -1) * (1 + randInt(10)); if (d >= 0) opts.add(d); }
  return { text: `${a} ${op} ${b}`, r, opts: shuffle([...opts]) };
}

function Mental({ tr, onFinish }) {
  const [round, setRound] = useState(0);
  const score = useRef(0);
  const q = useMemo(make, [round]);
  const left = useCountdown(LIMIT, () => onFinish({ won: score.current >= 10, score: score.current, title: tr(`答對 ${score.current} 題`, `${score.current} correct`), detail: tr('45 秒心算成績。', 'Your 45-second score.') }));
  const tap = v => { if (v === q.r) score.current += 1; else score.current = Math.max(0, score.current - 1); setRound(round + 1); };
  return (
    <View>
      <TimerBar left={left} total={LIMIT} score={score.current} scoreLabel={tr('得分', 'Score')} />
      <T v="largeTitle" accessibilityRole="header" style={{ textAlign: 'center', marginVertical: 26 }}>{q.text}</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {q.opts.map(v => <Button key={v} kind="secondary" style={{ width: '48%', flexGrow: 1 }} title={String(v)} onPress={() => tap(v)} />)}
      </View>
    </View>
  );
}

exports.default = Mental;
});

// ---- games/views/Quiz
__d('games/views/Quiz', function (exports, __r) {
const React = E0.default;
const { useEffect, useRef, useState } = E0;
const { View } = E1;
const { Icon } = __r('components/icons');
const { Banner, Button, T } = __r('components/ui');
const { useColors } = __r('theme/tokens');
const { TimerBar, useCountdown } = __r('games/views/shared');

function Quiz({ game, tr, data, onFinish }) {
  const c = useColors();
  const items = data.items;
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const scoreRef = useRef(0);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const finish = () => {
    clearTimeout(timer.current);
    const s = scoreRef.current; const won = s >= Math.ceil(items.length * 0.6);
    onFinish({ won, score: s, title: tr(`答對 ${s} / ${items.length} 題`, `${s} of ${items.length} right`), detail: won ? tr('反應很快！', 'Nicely done!') : tr('再來一局，題目會換新的。', 'Go again for fresh questions.') });
  };
  const left = useCountdown(game.limit || 0, finish, !!game.limit);
  const q = items[i];
  const choose = k => {
    if (picked !== null) return;
    const right = k === q.answer;
    if (right) { scoreRef.current += 1; setScore(scoreRef.current); }
    setPicked(k);
    timer.current = setTimeout(() => {
      if (i + 1 === items.length) finish();
      else { setI(i + 1); setPicked(null); }
    }, right ? 500 : 1100);
  };
  return (
    <View>
      {game.limit ? <TimerBar left={left} total={game.limit} score={score} scoreLabel={tr('得分', 'Score')} /> : null}
      <T v="footnote" color={c.secondary}>{tr(`第 ${i + 1} / ${items.length} 題`, `Question ${i + 1} of ${items.length}`)}</T>
      <T v="title2" accessibilityRole="header" style={{ marginTop: 6, marginBottom: 18 }}>{q.prompt}</T>
      {q.icons && (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, paddingVertical: 22, marginBottom: 18, borderRadius: 18, backgroundColor: c.surface, borderWidth: 1, borderColor: c.edge }}>
          {q.icons.map((n, k) => (
            <React.Fragment key={k}>
              {k > 0 && <T v="title2" color={c.secondary}>+</T>}
              <Icon name={n} size={56} color={c.accent} strokeWidth={1.5} />
            </React.Fragment>
          ))}
        </View>
      )}
      <View style={{ gap: 10 }}>
        {q.options.map((o, k) => {
          const show = picked !== null && (k === q.answer || k === picked);
          return (
            <Button key={`${i}-${k}`} kind="secondary" disabled={picked !== null && !show} onPress={() => choose(k)}
              icon={show ? (k === q.answer ? 'checkCircle' : 'closeCircle') : undefined} title={o} />
          );
        })}
      </View>
      {picked !== null && <Banner tone={picked === q.answer ? 'success' : 'error'} text={picked === q.answer ? tr('答對了！', 'Correct!') : tr(`答案是「${q.options[q.answer]}」`, `It was "${q.options[q.answer]}"`)} />}
    </View>
  );
}

exports.default = Quiz;
});

// ---- games/views/Reaction
__d('games/views/Reaction', function (exports, __r) {
const React = E0.default;
const { useEffect, useRef, useState } = E0;
const { Pressable, View } = E1;
const { Icon } = __r('components/icons');
const { T } = __r('components/ui');
const { useColors } = __r('theme/tokens');
const { randInt } = __r('games/views/shared');

const ROUNDS = 3;
function Reaction({ tr, onFinish }) {
  const c = useColors();
  const [phase, setPhaseState] = useState('wait');
  const [times, setTimes] = useState([]);
  const [early, setEarly] = useState(false);
  // Timing must not depend on a re-render: read the live phase at the instant of the press.
  const live = useRef({ phase: 'wait', times: [], started: 0 });
  const timer = useRef(null);
  const setPhase = p => { live.current.phase = p; setPhaseState(p); };
  const arm = () => {
    clearTimeout(timer.current);
    setPhase('wait');
    timer.current = setTimeout(() => { live.current.started = Date.now(); setPhase('go'); }, 1200 + randInt(2200));
  };
  useEffect(() => { arm(); return () => clearTimeout(timer.current); }, []);
  const tap = () => {
    if (live.current.phase !== 'go') { setEarly(true); arm(); return; }
    const t = [...live.current.times, Date.now() - live.current.started];
    live.current.times = t;
    setEarly(false); setTimes(t);
    if (t.length === ROUNDS) {
      clearTimeout(timer.current);
      setPhase('done');
      const avg = Math.round(t.reduce((a, b) => a + b, 0) / ROUNDS);
      onFinish({ won: avg < 400, score: avg, lower: true, title: tr(`平均 ${avg} 毫秒`, `${avg} ms average`), detail: avg < 300 ? tr('快得不像人！', 'Superhuman!') : tr('再來一局，看能不能更快。', 'Go again and beat it.') });
    } else arm();
  };
  const go = phase === 'go';
  return (
    <View>
      <T v="subhead" color={c.secondary} style={{ marginBottom: 14 }}>{tr(`第 ${times.length + 1} / ${ROUNDS} 次`, `Try ${times.length + 1} of ${ROUNDS}`)}{times.length ? ` · ${times[times.length - 1]} ms` : ''}</T>
      <Pressable accessibilityRole="button" accessibilityLabel={go ? tr('現在按', 'Tap now') : tr('等待提示', 'Wait for it')} accessibilityLiveRegion="assertive" delayPressIn={0} onPressIn={tap}
        style={{ height: 320, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: go ? c.accent : c.surface2 }}>
        <Icon name={go ? 'flash' : 'hourglass'} size={56} color={go ? c.onAccent : c.secondary} filled={go} />
        <T v="title" color={go ? c.onAccent : c.label} style={{ marginTop: 10 }}>{go ? tr('現在按！', 'Tap Now!') : early ? tr('太早了，再等等', 'Too soon, wait') : tr('等提示…', 'Wait for it…')}</T>
      </Pressable>
    </View>
  );
}

exports.default = Reaction;
});

// ---- games/views/Schulte
__d('games/views/Schulte', function (exports, __r) {
const React = E0.default;
const { useMemo, useRef, useState } = E0;
const { View } = E1;
const { shuffle } = __r('games/catalog');
const { Cell, Grid, TimerBar, useBoardSize, useCountdown } = __r('games/views/shared');

const LIMIT = 40;
function Schulte({ tr, onFinish }) {
  const size = useBoardSize();
  const nums = useMemo(() => shuffle([...Array(16).keys()].map(n => n + 1)), []);
  const [next, setNext] = useState(1);
  const reached = useRef(1);
  const left = useCountdown(LIMIT, () => onFinish({ won: false, title: tr(`追到 ${reached.current - 1}`, `Reached ${reached.current - 1}`), detail: tr('時間到，再衝一次！', "Time's up. Go again!") }));
  const tap = n => {
    if (n !== next) return;
    reached.current = n + 1; setNext(n + 1);
    if (n === 16) onFinish({ won: true, score: LIMIT - left, lower: true, title: tr(`${LIMIT - left} 秒完成`, `Done in ${LIMIT - left}s`), detail: tr('1 到 16 全部點完。', 'All the way from 1 to 16.') });
  };
  return (
    <View>
      <TimerBar left={left} total={LIMIT} score={next > 16 ? 16 : next} scoreLabel={tr('下一個', 'Next')} />
      <Grid n={4} size={size} render={i => <Cell text={nums[i]} disabled={nums[i] < next} muted={nums[i] < next} onPress={() => tap(nums[i])} />} />
    </View>
  );
}

exports.default = Schulte;
});

// ---- games/views/Simon
__d('games/views/Simon', function (exports, __r) {
const React = E0.default;
const { useEffect, useRef, useState } = E0;
const { View } = E1;
const { Banner, T } = __r('components/ui');
const { useColors } = __r('theme/tokens');
const { Cell, Grid, randInt, useBoardSize } = __r('games/views/shared');

function Simon({ tr, onFinish }) {
  const c = useColors();
  const size = useBoardSize(300);
  const [seq, setSeq] = useState(() => [randInt(4)]);
  const [lit, setLit] = useState(null);
  const [playing, setPlaying] = useState(true);
  const [pos, setPos] = useState(0);
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => {
    setPlaying(true); setPos(0);
    seq.forEach((v, i) => { later(() => setLit(v), 500 + i * 650); later(() => setLit(null), 500 + i * 650 + 420); });
    later(() => setPlaying(false), 500 + seq.length * 650);
    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [seq]);
  const tap = v => {
    if (playing) return;
    if (v !== seq[pos]) {
      const best = seq.length - 1;
      onFinish({ won: best >= 5, score: best, title: tr(`記住了 ${best} 步`, `${best} steps remembered`), detail: tr('再挑戰一次，看能記多長。', 'Try again and go longer.') });
      return;
    }
    setLit(v); later(() => setLit(null), 160);
    if (pos + 1 === seq.length) setSeq([...seq, randInt(4)]); else setPos(pos + 1);
  };
  return (
    <View>
      <T v="subhead" color={c.secondary} style={{ marginBottom: 14 }}>{tr(`長度 ${seq.length}`, `Length ${seq.length}`)}</T>
      <Grid n={2} size={size} gap={12} render={i => <Cell text={i + 1} fontSize={36} selected={lit === i} onPress={() => tap(i)} />} />
      <Banner tone="info" text={playing ? tr('看好順序…', 'Watch the order…') : tr('換你按！', 'Your turn!')} />
    </View>
  );
}

exports.default = Simon;
});

// ---- games/views/Slide
__d('games/views/Slide', function (exports, __r) {
const React = E0.default;
const { useEffect, useMemo, useRef, useState } = E0;
const { Animated, View } = E1;
const { spring, T, Tile, useReducedMotion } = __r('components/ui');
const { useColors } = __r('theme/tokens');
const { randInt, useBoardSize } = __r('games/views/shared');

const SOLVED = '1,2,3,4,5,6,7,8,0';
const adjacent = (a, b) => (Math.abs(a - b) === 3) || (Math.floor(a / 3) === Math.floor(b / 3) && Math.abs(a - b) === 1);
function scramble() {
  let t = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  do {
    for (let k = 0; k < 40; k++) {
      const e = t.indexOf(0);
      const opts = t.map((_, i) => i).filter(i => adjacent(i, e));
      const i = opts[randInt(opts.length)];
      [t[i], t[e]] = [t[e], t[i]];
    }
  } while (t.join(',') === SOLVED);
  return t;
}

function Piece({ n, x, y, cell, onPress }) {
  const reduced = useReducedMotion();
  const ax = useRef(new Animated.Value(x)).current;
  const ay = useRef(new Animated.Value(y)).current;
  useEffect(() => { spring(ax, x, { reduced }); spring(ay, y, { reduced }); }, [x, y]);
  return (
    <Animated.View style={{ position: 'absolute', width: cell, height: cell, transform: [{ translateX: ax }, { translateY: ay }] }}>
      <Tile radius={14} label={`${n}`} style={{ flex: 1 }} onPress={onPress}>
        <T style={{ fontSize: 28, lineHeight: 34, fontWeight: '700' }}>{n}</T>
      </Tile>
    </Animated.View>
  );
}

function Slide({ tr, onFinish }) {
  const c = useColors();
  const size = useBoardSize(320);
  const gap = 8;
  const cell = (size - gap * 2) / 3;
  const start = useMemo(scramble, []);
  const [tiles, setTiles] = useState(start);
  const [moves, setMoves] = useState(0);
  const move = n => {
    const i = tiles.indexOf(n); const e = tiles.indexOf(0);
    if (!adjacent(i, e)) return;
    const next = [...tiles]; [next[i], next[e]] = [next[e], next[i]];
    setTiles(next); setMoves(moves + 1);
    if (next.join(',') === SOLVED) setTimeout(() => onFinish({ won: true, score: moves + 1, lower: true, title: tr('拼好了！', 'Solved!'), detail: tr(`用了 ${moves + 1} 步。`, `${moves + 1} moves.`) }), 350);
  };
  return (
    <View>
      <T v="subhead" color={c.secondary} style={{ marginBottom: 14 }}>{tr(`把數字排成 1～8，空格在右下。已走 ${moves} 步`, `Arrange 1–8 with the gap last. ${moves} moves`)}</T>
      <View style={{ width: size, height: size, alignSelf: 'center', backgroundColor: c.surface2, borderRadius: 16 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => {
          const i = tiles.indexOf(n);
          return <Piece key={n} n={n} cell={cell} x={(i % 3) * (cell + gap)} y={Math.floor(i / 3) * (cell + gap)} onPress={() => move(n)} />;
        })}
      </View>
    </View>
  );
}

exports.default = Slide;
});

// ---- games/views/Stroop
__d('games/views/Stroop', function (exports, __r) {
const React = E0.default;
const { useMemo, useRef, useState } = E0;
const { View } = E1;
const { Button, T } = __r('components/ui');
const { useColors } = __r('theme/tokens');
const { randInt, TimerBar, useCountdown } = __r('games/views/shared');

const LIMIT = 30;
const COLORS = [
  { zh: '紅', en: 'Red', hex: '#D8392B' }, { zh: '藍', en: 'Blue', hex: '#2F6FDE' },
  { zh: '綠', en: 'Green', hex: '#1E9E55' }, { zh: '黃', en: 'Yellow', hex: '#C98A00' },
];

function Stroop({ tr, onFinish }) {
  const c = useColors();
  const [round, setRound] = useState(0);
  const score = useRef(0);
  const q = useMemo(() => { const word = randInt(4); return { word, ink: (word + 1 + randInt(3)) % 4 }; }, [round]);
  const left = useCountdown(LIMIT, () => onFinish({ won: score.current >= 12, score: score.current, title: tr(`答對 ${score.current} 題`, `${score.current} correct`), detail: tr('大腦沒被騙太多次。', 'Your brain resisted the trick.') }));
  const tap = k => { score.current = Math.max(0, score.current + (k === q.ink ? 1 : -1)); setRound(round + 1); };
  return (
    <View>
      <TimerBar left={left} total={LIMIT} score={score.current} scoreLabel={tr('得分', 'Score')} />
      <T v="subhead" color={c.secondary} style={{ textAlign: 'center' }}>{tr('這個字是用什麼顏色寫的？', 'What colour is this word printed in?')}</T>
      <T style={{ fontSize: 64, lineHeight: 78, fontWeight: '800', textAlign: 'center', marginVertical: 22 }} color={COLORS[q.ink].hex}>{tr(COLORS[q.word].zh, COLORS[q.word].en)}</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {COLORS.map((x, k) => <Button key={k} kind="secondary" style={{ width: '48%', flexGrow: 1 }} title={tr(x.zh, x.en)} onPress={() => tap(k)} />)}
      </View>
    </View>
  );
}

exports.default = Stroop;
});

// ---- games/views/Sudoku
__d('games/views/Sudoku', function (exports, __r) {
const React = E0.default;
const { useMemo, useState } = E0;
const { View } = E1;
const { Banner, Button, T } = __r('components/ui');
const { shuffle } = __r('games/catalog');
const { useColors } = __r('theme/tokens');
const { Cell, Grid, useBoardSize } = __r('games/views/shared');

function make() {
  const m = shuffle([1, 2, 3, 4]);
  const base = [[0, 1, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]].map(r => r.map(i => m[i]));
  const rows = shuffle(base).flat();
  const hide = new Set(shuffle([...Array(16).keys()]).slice(0, 8));
  return rows.map((v, i) => (hide.has(i) ? 0 : v));
}
const valid = b => [0, 1, 2, 3].every(k => new Set(b.slice(k * 4, k * 4 + 4)).size === 4 && new Set([0, 1, 2, 3].map(r => b[r * 4 + k])).size === 4);

function Sudoku({ tr, onFinish }) {
  const c = useColors();
  const size = useBoardSize(320);
  const clues = useMemo(make, []);
  const [board, setBoard] = useState(clues);
  const [sel, setSel] = useState(null);
  const [note, setNote] = useState(null);
  const put = n => { if (sel === null) return setNote(tr('先點一個空格。', 'Tap an empty cell first.')); const b = [...board]; b[sel] = n; setBoard(b); setNote(null); };
  const check = () => {
    if (board.includes(0)) return setNote(tr('還有空格沒填。', 'Some cells are still empty.'));
    if (valid(board)) return onFinish({ won: true, title: tr('解開了！', 'Solved!'), detail: tr('每列每行都沒有重複。', 'No repeats anywhere.') });
    setNote(tr('有數字重複了，再看看。', 'Something repeats. Take another look.'));
  };
  return (
    <View>
      <T v="subhead" color={c.secondary} style={{ marginBottom: 14 }}>{tr('填入 1～4，每一列和每一行都不能重複。', 'Fill in 1–4. No repeats in any row or column.')}</T>
      <Grid n={4} size={size} render={i => <Cell text={board[i] || ''} muted={!!clues[i]} disabled={!!clues[i]} selected={sel === i} label={board[i] ? `${board[i]}` : tr('空格', 'Empty')} onPress={() => setSel(i)} />} />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 18, width: size, alignSelf: 'center' }}>
        {[1, 2, 3, 4].map(n => <View key={n} style={{ flex: 1, height: 58 }}><Cell text={n} label={tr(`填入 ${n}`, `Enter ${n}`)} onPress={() => put(n)} /></View>)}
      </View>
      {note && <Banner tone="info" text={note} />}
      <Button style={{ marginTop: 16 }} title={tr('檢查答案', 'Check Answer')} onPress={check} />
    </View>
  );
}

exports.default = Sudoku;
});

// ---- games/views/WordSearch
__d('games/views/WordSearch', function (exports, __r) {
const React = E0.default;
const { useMemo, useState } = E0;
const { View } = E1;
const { Banner, T } = __r('components/ui');
const { useColors } = __r('theme/tokens');
const { Cell, Grid, randInt, useBoardSize } = __r('games/views/shared');

const N = 5;
function build(word) {
  const across = Math.random() < 0.5;
  const line = randInt(N);
  const start = randInt(N - word.length + 1);
  const path = [...word].map((_, i) => (across ? line * N + start + i : (start + i) * N + line));
  const letters = Array.from({ length: N * N }, () => String.fromCharCode(65 + randInt(26)));
  path.forEach((p, i) => { letters[p] = word[i]; });
  return { letters, path };
}

function WordSearch({ tr, data, onFinish }) {
  const c = useColors();
  const size = useBoardSize();
  const [round, setRound] = useState(0);
  const [got, setGot] = useState(0);
  const [miss, setMiss] = useState(false);
  const item = data.items[round];
  const { letters, path } = useMemo(() => build(item.word), [item.word]);
  const tap = i => {
    if (i !== path[got]) { setGot(0); setMiss(true); return; }
    setMiss(false);
    if (got + 1 < path.length) { setGot(got + 1); return; }
    if (round + 1 === data.items.length) { onFinish({ won: true, title: tr('全部找到了！', 'Found them all!'), detail: tr(`找到 ${data.items.length} 個單字。`, `${data.items.length} words found.`) }); return; }
    setRound(round + 1); setGot(0);
  };
  return (
    <View>
      <T v="footnote" color={c.secondary}>{tr(`第 ${round + 1} / ${data.items.length} 個`, `Word ${round + 1} of ${data.items.length}`)}</T>
      <T v="headline" style={{ marginTop: 2 }}>{tr('提示：', 'Hint: ')}{item.hint}</T>
      <T v="title2" style={{ marginTop: 6, marginBottom: 12, letterSpacing: 3 }}>{[...item.word].map((ch, i) => (i < got ? ch : '＿')).join(' ')}</T>
      <Grid n={N} size={size} gap={6} render={i => <Cell text={letters[i]} fontSize={20} selected={path.indexOf(i) >= 0 && path.indexOf(i) < got} onPress={() => tap(i)} />} />
      {miss && <Banner tone="error" text={tr('順序不對，從第一個字母重來。單字是直的或橫的。', 'Wrong letter. Start again; words run across or down.')} />}
    </View>
  );
}

exports.default = WordSearch;
});

// ---- games/views/shared
__d('games/views/shared', function (exports, __r) {
const React = E0.default;
const { useEffect, useRef, useState } = E0;
const { Platform, useWindowDimensions, View } = E1;
const { Icon } = __r('components/icons');
const { T, Tile } = __r('components/ui');
const { useColors } = __r('theme/tokens');

const randInt = n => Math.floor(Math.random() * n);

function useBoardSize(max = 360) {
  const { width } = useWindowDimensions();
  return Math.min(Math.min(width, 640) - 40, max);
}

function useCountdown(secs, onEnd, active = true) {
  const [left, setLeft] = useState(secs);
  const end = useRef(onEnd); end.current = onEnd;
  useEffect(() => {
    if (!active) return undefined;
    const t = setInterval(() => setLeft(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [active]);
  useEffect(() => { if (left <= 0 && active) end.current(); }, [left, active]);
  return Math.max(0, left);
}

function TimerBar({ left, total, score, scoreLabel }) {
  const c = useColors();
  const low = left <= 5;
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="timer" size={18} color={low ? c.danger : c.secondary} strokeWidth={2} />
          <T v="headline" color={low ? c.danger : c.label} accessibilityLabel={`${left}`}>{left}s</T>
        </View>
        {score !== undefined && <T v="headline">{scoreLabel} {score}</T>}
      </View>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: c.surface2, overflow: 'hidden' }}>
        <View style={{ height: 6, width: `${(left / total) * 100}%`, borderRadius: 3, backgroundColor: low ? c.danger : c.accent }} />
      </View>
    </View>
  );
}

function Grid({ n, size, gap = 8, count, render }) {
  const cell = (size - gap * (n - 1)) / n;
  return (
    <View style={{ width: size, alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', gap }}>
      {Array.from({ length: count ?? n * n }, (_, i) => <View key={i} style={{ width: cell, height: cell }}>{render(i, cell)}</View>)}
    </View>
  );
}

function Cell({ text, icon, selected, disabled, onPress, label, muted, fontSize = 24 }) {
  const c = useColors();
  return (
    <Tile radius={12} selected={selected} disabled={disabled} onPress={onPress} label={label || String(text ?? '')}
      style={{ flex: 1 }} faceStyle={muted ? { backgroundColor: c.surface2 } : null}>
      {icon ? <Icon name={icon} size={fontSize + 14} color={c.label} /> : <T style={{ fontSize, lineHeight: fontSize + 6, fontWeight: '700' }}>{text}</T>}
    </Tile>
  );
}

function Pad({ onMove, tr }) {
  const Key = ({ icon, dir, label }) => (
    <Tile radius={14} label={label} style={{ width: 62, height: 58 }} onPress={() => onMove(dir)}>
      <PadIcon name={icon} />
    </Tile>
  );
  return (
    <View style={{ alignItems: 'center', gap: 6, marginTop: 18 }}>
      <Key icon="arrowUp" dir="up" label={tr('上', 'Up')} />
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <Key icon="arrowLeft" dir="left" label={tr('左', 'Left')} />
        <Key icon="arrowDown" dir="down" label={tr('下', 'Down')} />
        <Key icon="arrowRight" dir="right" label={tr('右', 'Right')} />
      </View>
    </View>
  );
}
function PadIcon({ name }) { const c = useColors(); return <Icon name={name} size={24} color={c.label} strokeWidth={2} />; }

function useArrowKeys(onMove) {
  const fn = useRef(onMove); fn.current = onMove;
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;
    const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    const h = e => { if (map[e.key]) { e.preventDefault(); fn.current(map[e.key]); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
}

exports.randInt = randInt;
exports.useBoardSize = useBoardSize;
exports.useCountdown = useCountdown;
exports.TimerBar = TimerBar;
exports.Grid = Grid;
exports.Cell = Cell;
exports.Pad = Pad;
exports.useArrowKeys = useArrowKeys;
});

// ---- lib/api
__d('lib/api', function (exports, __r) {
const { Platform } = E1;

// The deployed website calls its own origin. Phones and local previews need the full server address.
const { API_URL } = __r('config');
const BASE = (process.env.EXPO_PUBLIC_API_URL || API_URL || '').replace(/\/+$/, '');

let token = null;
const setToken = value => { token = value; };

class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function api(path, { method = 'GET', body, timeoutMs } = {}) {
  if (!BASE && Platform.OS !== 'web') throw new ApiError('EXPO_PUBLIC_API_URL is not set.', 'no_server', 0);
  const ctrl = new AbortController();
  const timer = timeoutMs ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      signal: ctrl.signal,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : null),
        ...(token ? { Authorization: `Bearer ${token}` } : null),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Could not reach the server.', 'network', 0);
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error?.message || `Server error ${res.status}`, data?.error?.code || 'server_error', res.status);
  return data;
}

// One room, or every room when none is given. Returns null if no server address is configured.
function chatSocket(room) {
  if (!BASE && Platform.OS !== 'web') return null;
  const origin = BASE || window.location.origin;
  const query = room ? `?room=${encodeURIComponent(room)}` : '';
  return new WebSocket(`${origin.replace(/^http/, 'ws')}/api/ws${query}`);
}

exports.setToken = setToken;
exports.ApiError = ApiError;
exports.api = api;
exports.chatSocket = chatSocket;
});

// ---- lib/install
__d('lib/install', function (exports, __r) {
const { useEffect, useState } = E0;
const { Platform } = E1;

// Browsers offer the install prompt once, often before the first render, so catch it at load.
let deferred = null;
let installed = false;
const listeners = new Set();
const notify = () => listeners.forEach(fn => fn());

const WEB = Platform.OS === 'web' && typeof window !== 'undefined';

if (WEB) {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; notify(); });
  window.addEventListener('appinstalled', () => { installed = true; deferred = null; notify(); });
}

const runningInstalled = () => window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
// iPads report themselves as Macs, so touch support tells them apart.
const isIOS = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);

// 'prompt': the browser can show its install dialog. 'ios': Apple allows no dialog, so show the steps.
// 'menu': some other browser, where any install option is in its own menu. 'none': nothing to offer.
function currentMode() {
  if (!WEB || installed || runningInstalled()) return 'none';
  if (deferred) return 'prompt';
  if (isIOS()) return 'ios';
  return window.isSecureContext ? 'menu' : 'none';
}

function useInstall() {
  const [mode, setMode] = useState(currentMode);
  useEffect(() => {
    const update = () => setMode(currentMode());
    update();
    listeners.add(update);
    return () => listeners.delete(update);
  }, []);
  const install = async () => {
    if (!deferred) return;
    const event = deferred;
    await event.prompt();
    await event.userChoice.catch(() => null);
    // A prompt only works once. The browser fires a new event if the visitor can still install.
    deferred = null;
    notify();
  };
  return { mode, install };
}

exports.useInstall = useInstall;
});

// ---- screens/AuthScreen
__d('screens/AuthScreen', function (exports, __r) {
const React = E0.default;
const { useRef, useState } = E0;
const { KeyboardAvoidingView, Platform, View } = E1;
const { useSafeAreaInsets } = E3;
const Mascot = __r('components/Mascot').default;
const { Banner, Button, Field, Group, IconButton, Page, T } = __r('components/ui');
const { useStore } = __r('state/store');
const { useColors } = __r('theme/tokens');

function explain(error, tr) {
  const zh = {
    invalid_credentials: 'Email 或密碼不正確，請再試一次。',
    invalid_email: '請輸入正確的 Email。',
    invalid_password: '密碼需要 6 到 200 個字元。',
    invalid_nickname: '請輸入 40 字以內的暱稱。',
    email_taken: '這個 Email 已經註冊過了，請直接登入。',
    rate_limited: '嘗試太多次了，請稍後再試。',
    network: '連不上伺服器，請稍後再試。',
    no_server: '還沒有設定伺服器位址（EXPO_PUBLIC_API_URL）。',
  }[error.code];
  return tr(zh || '發生錯誤，請稍後再試。', error.message);
}

function FieldRow({ label, children, last }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 16, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.separator }}>
      <T v="body" style={{ width: 64 }}>{label}</T>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>{children}</View>
    </View>
  );
}

function AuthScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { tr, signIn, signUp, skipAuth, setAuthOpen } = useStore();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [reveal, setReveal] = useState(false);
  const [covering, setCovering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);
  const passwordRef = useRef(null);
  const register = mode === 'register';

  const close = () => { skipAuth(); setAuthOpen(false); };

  async function submit() {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setNote({ tone: 'error', text: tr('請輸入正確的 Email。', 'Enter a valid email.') });
    if (password.length < 6) return setNote({ tone: 'error', text: tr('密碼至少需要 6 個字元。', 'Password needs at least 6 characters.') });
    if (register && !nickname.trim()) return setNote({ tone: 'error', text: tr('請輸入暱稱。', 'Enter a nickname.') });
    setBusy(true); setNote(null);
    try {
      await (register ? signUp(email, password, nickname) : signIn(email, password));
    } catch (e) {
      setNote({ tone: 'error', text: explain(e, tr) });
    } finally {
      setBusy(false);
    }
  }

  const switchMode = () => { setMode(register ? 'login' : 'register'); setNote(null); };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingTop: insets.top, paddingHorizontal: 8, alignItems: 'flex-start' }}>
        <IconButton icon="close" label={tr('先逛逛', 'Browse first')} onPress={close} color={c.secondary} />
      </View>
      <Page>
        <Mascot covering={covering && !reveal} />
        <T v="title" accessibilityRole="header" style={{ textAlign: 'center', marginTop: 18 }}>{register ? tr('建立帳號', 'Create Account') : tr('歡迎回來', 'Welcome Back')}</T>
        <T v="subhead" color={c.secondary} style={{ textAlign: 'center', marginTop: 4, marginBottom: 22 }}>
          {register ? tr('收藏、遊玩紀錄會跟著帳號走', 'Your saves and history follow your account') : tr('登入後就能收藏遊戲、加入聊天', 'Log in to save games and join the chat')}
        </T>
        <Group>
          {register && (
            <FieldRow label={tr('暱稱', 'Name')}>
              <Field accessibilityLabel={tr('暱稱', 'Name')} style={{ flex: 1 }} value={nickname} onChangeText={setNickname} placeholder={tr('大家會看到的名字', 'Shown to others')} maxLength={40} autoComplete="nickname" />
            </FieldRow>
          )}
          <FieldRow label="Email">
            <Field accessibilityLabel="Email" style={{ flex: 1 }} value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()} />
          </FieldRow>
          <FieldRow label={tr('密碼', 'Password')} last>
            <Field ref={passwordRef} accessibilityLabel={tr('密碼', 'Password')} style={{ flex: 1 }} value={password} onChangeText={setPassword} placeholder={tr('至少 6 個字元', 'At least 6 characters')} secureTextEntry={!reveal} autoCapitalize="none" autoComplete={register ? 'new-password' : 'current-password'} returnKeyType="go" onSubmitEditing={submit} onFocus={() => setCovering(true)} onBlur={() => setCovering(false)} />
            <IconButton icon={reveal ? 'eyeOff' : 'eye'} label={reveal ? tr('隱藏密碼', 'Hide password') : tr('顯示密碼', 'Show password')} onPress={() => setReveal(!reveal)} color={c.secondary} />
          </FieldRow>
        </Group>
        {note && <Banner tone={note.tone} text={note.text} />}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
          <Button kind="secondary" style={{ flex: 1 }} title={register ? tr('返回登入', 'Back to Log In') : tr('註冊', 'Sign Up')} onPress={switchMode} />
          <Button style={{ flex: 1 }} disabled={busy} title={busy ? tr('處理中…', 'Working…') : register ? tr('註冊', 'Sign Up') : tr('登入', 'Log In')} onPress={submit} />
        </View>
      </Page>
    </KeyboardAvoidingView>
  );
}

exports.default = AuthScreen;
});

// ---- screens/ChatScreen
__d('screens/ChatScreen', function (exports, __r) {
const React = E0.default;
const { useEffect, useRef, useState } = E0;
const { ActivityIndicator, KeyboardAvoidingView, Platform, View } = E1;
const { useSafeAreaInsets } = E3;
const { Badge, Banner, Button, EmptyState, Field, Group, IconButton, NavBar, Page, Row, T } = __r('components/ui');
const { ROOMS } = __r('data/rooms');
const { api, chatSocket } = __r('lib/api');
const { useStore } = __r('state/store');
const { useColors } = __r('theme/tokens');

function ChatListScreen({ nav }) {
  const insets = useSafeAreaInsets();
  const { tr } = useStore();
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Page>
        <T v="largeTitle" accessibilityRole="header" style={{ marginTop: 8, marginBottom: 16 }}>{tr('聊天室', 'Chat')}</T>
        <Group>
          {ROOMS.map((r, i) => (
            <Row key={r.id} last={i === ROOMS.length - 1} label={tr(r.zh, r.en)} title={tr(r.zh, r.en)}
              leading={<Badge icon={r.icon} />} onPress={() => nav.push('room', { room: r.id })} />
          ))}
        </Group>
      </Page>
    </View>
  );
}

const unavailable = (msg, tr) => tr(`聊天室連線失敗：${msg}`, `Chat connection failed: ${msg}`);

function ChatRoomScreen({ room: roomId, nav }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { tr, user, setAuthOpen } = useStore();
  const room = ROOMS.find(r => r.id === roomId);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scroll = useRef(null);

  const add = m => setMessages(old => (old.some(x => x.id === m.id) ? old : [...old, m]));

  useEffect(() => {
    let alive = true;
    let socket = null;
    let retry = null;
    const load = () => api(`/rooms/${roomId}/messages`).then(({ messages: rows }) => {
      if (!alive) return;
      setError(null);
      setMessages(old => { const seen = new Set(rows.map(m => m.id)); return [...rows, ...old.filter(m => !seen.has(m.id))]; });
    }).catch(e => { if (alive) setError(e.message); }).finally(() => { if (alive) setLoading(false); });
    // A reconnect reloads history, so anything sent while the socket was down still appears.
    const connect = reload => {
      socket = chatSocket(roomId);
      if (!socket) return;
      socket.onopen = () => { if (reload) load(); };
      socket.onmessage = e => add(JSON.parse(e.data));
      socket.onclose = () => { if (alive) retry = setTimeout(() => connect(true), 3000); };
    };
    load();
    connect(false);
    return () => { alive = false; clearTimeout(retry); socket?.close(); };
  }, [roomId]);

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const { message } = await api(`/rooms/${roomId}/messages`, { method: 'POST', body: { body } });
      setError(null); setDraft(''); add(message);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <NavBar title={tr('聊天室', 'Chat')} backLabel={tr('返回', 'Back')} onBack={nav.back} />
      <Page bottom={12} scrollRef={scroll} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 8 }}>
          <Badge icon={room.icon} />
          <T v="headline" accessibilityRole="header" style={{ flex: 1 }}>{tr(room.zh, room.en)}</T>
        </View>
        {error && <Banner tone="error" text={unavailable(error, tr)} />}
        {loading && <ActivityIndicator color={c.accent} style={{ marginTop: 24 }} />}
        {!loading && !error && !messages.length && <EmptyState icon="chat" title={tr('還沒有人說話', 'No Messages Yet')} body={tr('當第一個開口的人吧！', 'Be the first to say something!')} />}
        {messages.map(m => {
          const mine = user && m.user_id === user.id;
          return (
            <View key={m.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '82%', marginTop: 10 }}>
              {!mine && <T v="caption" color={c.secondary} style={{ marginBottom: 3, marginLeft: 4 }}>{m.author}</T>}
              <View style={{ backgroundColor: mine ? c.accent : c.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9, borderWidth: mine ? 0 : 1, borderColor: c.edge }}>
                <T v="body" color={mine ? c.onAccent : c.label}>{m.body}</T>
              </View>
            </View>
          );
        })}
      </Page>
      <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 + insets.bottom, backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.separator }}>
        {user ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
            <Field accessibilityLabel={tr('訊息', 'Message')} style={{ flex: 1, paddingHorizontal: 12 }} value={draft} onChangeText={setDraft} placeholder={tr('說點什麼…', 'Say something…')} maxLength={500} returnKeyType="send" onSubmitEditing={send} />
            <IconButton icon="send" label={tr('送出', 'Send')} onPress={send} color={draft.trim() ? c.accent : c.placeholder} />
          </View>
        ) : (
          <Button kind="secondary" icon="logIn" title={tr('登入後加入聊天', 'Log In to Chat')} onPress={() => setAuthOpen(true)} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

exports.default = ChatRoomScreen;
exports.ChatListScreen = ChatListScreen;
});

// ---- screens/FavoritesScreen
__d('screens/FavoritesScreen', function (exports, __r) {
const React = E0.default;
const { View } = E1;
const { useSafeAreaInsets } = E3;
const GameRow = __r('components/GameRow').default;
const { Banner, Button, EmptyState, Group, Page, T } = __r('components/ui');
const { gameById } = __r('games/catalog');
const { useStore } = __r('state/store');

function FavoritesScreen({ nav }) {
  const insets = useSafeAreaInsets();
  const { tr, favorites, user, setAuthOpen, dbError } = useStore();
  const games = favorites.map(gameById).filter(Boolean);
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Page>
        <T v="largeTitle" accessibilityRole="header" style={{ marginTop: 8, marginBottom: 16 }}>{tr('我的收藏', 'Saved')}</T>
        {user && dbError && <Banner tone="error" text={tr(`收藏無法同步：${dbError}`, `Could not sync saves: ${dbError}`)} />}
        {games.length ? (
          <>
            <Button icon="shuffle" kind="secondary" style={{ marginBottom: 14 }} title={tr('從收藏隨便挑一款', 'Random from Saved')} onPress={() => nav.push('game', { id: games[Math.floor(Math.random() * games.length)].id })} />
            <Group>{games.map((g, i) => <GameRow key={g.id} game={g} nav={nav} last={i === games.length - 1} />)}</Group>
          </>
        ) : (
          <EmptyState icon="heart" title={tr('還沒有收藏', 'Nothing Saved Yet')} body={tr('玩到喜歡的遊戲，按愛心就會出現在這裡。', 'Tap the heart on a game you like and it lands here.')}>
            <Button icon="gamepad" title={tr('去找遊戲', 'Find a Game')} onPress={() => nav.tab('home')} />
          </EmptyState>
        )}
        {!user && <Button style={{ marginTop: 14 }} kind="secondary" icon="logIn" title={tr('登入後同步收藏', 'Log In to Sync Saves')} onPress={() => setAuthOpen(true)} />}
      </Page>
    </View>
  );
}

exports.default = FavoritesScreen;
});

// ---- screens/GameListScreen
__d('screens/GameListScreen', function (exports, __r) {
const React = E0.default;
const { View } = E1;
const GameRow = __r('components/GameRow').default;
const { Button, Group, NavBar, Page } = __r('components/ui');
const { GAMES } = __r('games/catalog');
const { useStore } = __r('state/store');

function GameListScreen({ type, nav }) {
  const { tr, pickFresh } = useStore();
  const games = GAMES.filter(g => g.type === type);
  return (
    <View style={{ flex: 1 }}>
      <NavBar title={type === 'puzzle' ? tr('益智遊戲', 'Puzzle') : tr('挑戰遊戲', 'Challenge')} backLabel={tr('首頁', 'Home')} onBack={nav.back} />
      <Page>
        <Button icon="dice" kind="secondary" style={{ marginBottom: 14 }} title={tr('這類隨便來一款', 'Surprise Me')} onPress={() => nav.push('game', { id: pickFresh(undefined, type).id })} />
        <Group>{games.map((g, i) => <GameRow key={g.id} game={g} nav={nav} last={i === games.length - 1} />)}</Group>
      </Page>
    </View>
  );
}

exports.default = GameListScreen;
});

// ---- screens/GameScreen
__d('screens/GameScreen', function (exports, __r) {
const React = E0.default;
const { useEffect, useState } = E0;
const { ActivityIndicator, View } = E1;
const { Badge, Button, Chip, IconButton, NavBar, Page, T } = __r('components/ui');
const { gameById, loadMemorySet, loadPairs, loadQuiz, loadWords } = __r('games/catalog');
const FindDifferent = __r('games/views/FindDifferent').default;
const G2048 = __r('games/views/G2048').default;
const Matchstick = __r('games/views/Matchstick').default;
const Maze = __r('games/views/Maze').default;
const Memory = __r('games/views/Memory').default;
const Mental = __r('games/views/Mental').default;
const Quiz = __r('games/views/Quiz').default;
const Reaction = __r('games/views/Reaction').default;
const Schulte = __r('games/views/Schulte').default;
const Simon = __r('games/views/Simon').default;
const Slide = __r('games/views/Slide').default;
const Stroop = __r('games/views/Stroop').default;
const Sudoku = __r('games/views/Sudoku').default;
const WordSearch = __r('games/views/WordSearch').default;
const { useStore } = __r('state/store');
const { useColors } = __r('theme/tokens');

const VIEWS = { sudoku: Sudoku, wordsearch: WordSearch, finddiff: FindDifferent, matchstick: Matchstick, slide: Slide, memory: Memory, quiz: Quiz, maze: Maze, g2048: G2048, mental: Mental, stroop: Stroop, reaction: Reaction, schulte: Schulte, simon: Simon };

function loader(game, lang) {
  if (game.kind === 'quiz') return loadQuiz(game, lang);
  if (game.kind === 'wordsearch') return loadWords(lang);
  if (game.kind === 'finddiff') return loadPairs();
  if (game.kind === 'memory') return loadMemorySet();
  return null;
}

function GameScreen({ gameId, nav }) {
  const c = useColors();
  const { tr, lang, favorites, records, toggleFavorite, markPlayed, pickFresh } = useStore();
  const game = gameById(gameId);
  const [round, setRound] = useState(0);
  const [data, setData] = useState(null);
  const [result, setResult] = useState(null);
  const saved = favorites.includes(game.id);
  const needsData = !!loader(game, lang);

  useEffect(() => {
    let alive = true;
    setData(null); setResult(null);
    const p = loader(game, lang);
    if (p) p.then(d => alive && setData(d));
    return () => { alive = false; };
  }, [round, gameId]);

  const finish = r => {
    const prev = records[game.id]?.best;
    const last = records[game.id]?.last?.score;
    const hasScore = Number.isInteger(r.score);
    const isBest = hasScore && (prev == null || (r.lower ? r.score < prev : r.score > prev));
    markPlayed(game.id, r.won, hasScore ? r.score : undefined, r.lower);
    setResult({ ...r, isBest, prev: isBest ? null : prev, last });
  };
  const View_ = VIEWS[game.kind];
  const name = tr(game.zh, game.en);

  return (
    <View style={{ flex: 1 }}>
      <NavBar title={name} backLabel={tr('返回', 'Back')} onBack={nav.back}
        right={<IconButton icon="heart" filled={saved} color={saved ? c.danger : c.accent} label={saved ? tr('取消收藏', 'Remove from saved') : tr('收藏', 'Save')} onPress={() => toggleFavorite(game.id)} />} />
      <Page>
        {result ? (
          <View style={{ alignItems: 'center', paddingTop: 28 }}>
            <Badge icon={result.won ? 'party' : game.icon} tone={result.won ? 'puzzle' : 'neutral'} size={96} />
            <T v="title" accessibilityRole="header" accessibilityLiveRegion="polite" style={{ marginTop: 18, textAlign: 'center' }}>{result.title}</T>
            <T v="body" color={c.secondary} style={{ marginTop: 4, textAlign: 'center' }}>{result.detail}</T>
            {result.isBest && <View style={{ marginTop: 12 }}><Chip tone="accent" text={tr('新紀錄！', 'New best!')} /></View>}
            {(result.last != null || result.prev != null) && (
              <T v="footnote" color={c.secondary} style={{ marginTop: 10, textAlign: 'center' }}>
                {[result.last != null && tr(`上次 ${result.last}`, `Last ${result.last}`), result.prev != null && tr(`最佳 ${result.prev}`, `Best ${result.prev}`)].filter(Boolean).join(tr('　', '   '))}
              </T>
            )}
            <View style={{ alignSelf: 'stretch', gap: 10, marginTop: 26 }}>
              <Button icon="shuffle" title={tr('換一款新鮮的', 'Try Something New')} onPress={() => nav.replace('game', { id: pickFresh(game.id).id })} />
              <Button kind="secondary" icon="refresh" title={tr('再來一局', 'Play Again')} onPress={() => setRound(round + 1)} />
            </View>
          </View>
        ) : needsData && !data ? (
          <View style={{ alignItems: 'center', paddingTop: 80 }} accessibilityLiveRegion="polite">
            <ActivityIndicator size="large" color={c.accent} />
            <T v="subhead" color={c.secondary} style={{ marginTop: 14 }}>{tr('正在準備新題目…', 'Getting fresh questions…')}</T>
          </View>
        ) : (
          <>
            {needsData && data.source && <View style={{ alignSelf: 'flex-start', marginBottom: 12 }}><Chip tone={data.source === 'gemini' ? 'accent' : 'neutral'} text={data.source === 'gemini' ? tr('Gemini 出題', 'By Gemini') : tr('內建題庫', 'Built-in set')} /></View>}
            <View_ key={round} game={game} tr={tr} data={data} onFinish={finish} />
          </>
        )}
      </Page>
    </View>
  );
}

exports.default = GameScreen;
});

// ---- screens/HomeScreen
__d('screens/HomeScreen', function (exports, __r) {
const React = E0.default;
const { useState } = E0;
const { Pressable, ScrollView, useWindowDimensions, View } = E1;
const { useSafeAreaInsets } = E3;
const { Icon } = __r('components/icons');
const InstallCard = __r('components/InstallCard').default;
const Logo = __r('components/Logo').default;
const PickerSheet = __r('components/PickerSheet').default;
const { Badge, Button, Group, Page, Row, Section, T, Tile } = __r('components/ui');
const { ROOMS } = __r('data/rooms');
const { GAMES, gameById } = __r('games/catalog');
const { useStore } = __r('state/store');
const { useColors } = __r('theme/tokens');

function HomeScreen({ nav }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const { tr, played, favorites } = useStore();
  const [picking, setPicking] = useState(false);
  const fresh = GAMES.filter(g => !played[g.id]).length;
  const stacked = fontScale >= 1.4;
  const saved = favorites.map(gameById).filter(Boolean);
  const room = ROOMS[new Date().getDate() % ROOMS.length];

  const TypeTile = ({ type, icon, title, blurb }) => (
    <Tile radius={20} style={{ flex: stacked ? undefined : 1 }} label={title}
      faceStyle={{ minHeight: 148, padding: 16, alignItems: 'flex-start', justifyContent: 'space-between' }}
      onPress={() => nav.push('list', { type })}>
      <Badge icon={icon} tone={type} size={46} />
      <View style={{ marginTop: 18 }}>
        <T v="title2">{title}</T>
        <T v="footnote" color={c.secondary} style={{ marginTop: 2 }}>{blurb}</T>
      </View>
    </Tile>
  );

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Page>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10, marginBottom: 22 }}>
          <Logo size={56} />
          <View style={{ flex: 1 }}>
            <T v="title" accessibilityRole="header">玩擲</T>
            <T v="footnote" color={c.secondary} style={{ marginTop: 1 }}>
              {fresh ? tr(`還有 ${fresh} 款沒玩過，每局不用三分鐘`, `${fresh} games still new, each under three minutes`) : tr('全部玩過了！題目每次都不一樣', 'You played them all! Questions change every time')}
            </T>
          </View>
        </View>
        <View style={{ flexDirection: stacked ? 'column' : 'row', gap: 12 }}>
          <TypeTile type="puzzle" icon="puzzle" title={tr('益智遊戲', 'Puzzle')} blurb={tr('10 款 · 動動腦', '10 games · think')} />
          <TypeTile type="challenge" icon="trophy" title={tr('挑戰遊戲', 'Challenge')} blurb={tr('10 款 · 拚手速', '10 games · race')} />
        </View>
        <Button style={{ marginTop: 12 }} icon="dice" title={tr('不知道玩什麼？幫我選！', "Can't decide? Pick for Me!")} onPress={() => setPicking(true)} />

        <InstallCard dismissible style={{ marginTop: 14 }} />

        <Section title={tr('我的收藏', 'Saved')}>
          {saved.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 8 }}>
              {saved.map(g => (
                <Tile key={g.id} radius={16} label={tr(g.zh, g.en)} style={{ width: 108 }} faceStyle={{ padding: 12, minHeight: 104 }} onPress={() => nav.push('game', { id: g.id })}>
                  <Badge icon={g.icon} tone={g.type} size={40} />
                  <T v="footnote" numberOfLines={2} style={{ textAlign: 'center', marginTop: 8, fontWeight: '600' }}>{tr(g.zh, g.en)}</T>
                </Tile>
              ))}
            </ScrollView>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => nav.tab('favorites')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 64, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18, backgroundColor: c.surface, borderWidth: 1, borderColor: c.edge }}>
              <Icon name="heart" size={22} color={c.secondary} />
              <T v="subhead" color={c.secondary} style={{ flex: 1 }}>{tr('按遊戲旁的愛心，喜歡的就不會忘記', 'Tap the heart beside a game to keep it here')}</T>
            </Pressable>
          )}
        </Section>

        <Section title={tr('聊天室', 'Chat')}>
          <Group>
            <Row last label={tr(room.zh, room.en)} title={tr(room.zh, room.en)} subtitle={tr('今日話題，進來聊聊', "Today's topic, come say hi")}
              leading={<Badge icon={room.icon} />} onPress={() => nav.push('room', { room: room.id })} />
          </Group>
        </Section>
      </Page>
      {picking && <PickerSheet onClose={() => setPicking(false)} onPlay={g => { setPicking(false); nav.push('game', { id: g.id }); }} />}
    </View>
  );
}

exports.default = HomeScreen;
});

// ---- screens/ProfileScreen
__d('screens/ProfileScreen', function (exports, __r) {
const React = E0.default;
const { View } = E1;
const { useSafeAreaInsets } = E3;
const InstallCard = __r('components/InstallCard').default;
const Logo = __r('components/Logo').default;
const { Banner, Button, Group, Page, Row, Section, Segmented, T } = __r('components/ui');
const { GAMES } = __r('games/catalog');
const { useStore } = __r('state/store');
const { useColors } = __r('theme/tokens');

function ProfileScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { tr, user, lang, setLang, played, records, favorites, signOut, setAuthOpen, dbError } = useStore();
  const count = GAMES.filter(g => played[g.id]).length;
  const scored = GAMES.filter(g => records[g.id]?.best != null);
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Page>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10 }}>
          <Logo size={56} />
          <View style={{ flex: 1 }}>
            <T v="title" accessibilityRole="header" numberOfLines={1}>{user ? user.name : tr('訪客', 'Guest')}</T>
            <T v="footnote" color={c.secondary} numberOfLines={1} style={{ marginTop: 1 }}>{user ? user.email : tr('紀錄只存在這台裝置', 'Your progress stays on this device')}</T>
          </View>
        </View>
        {user && dbError && <Banner tone="error" text={tr(`資料庫連線問題：${dbError}`, `Database problem: ${dbError}`)} />}
        <Section title={tr('紀錄', 'Progress')}>
          <Group>
            <Row title={tr('玩過的遊戲', 'Games played')} trailing={<T v="headline">{count} / {GAMES.length}</T>} />
            <Row last title={tr('收藏', 'Saved')} trailing={<T v="headline">{favorites.length}</T>} />
          </Group>
        </Section>
        <Section title={tr('最佳成績', 'Best scores')}>
          {scored.length ? (
            <Group>
              {scored.map((g, i) => {
                const r = records[g.id];
                return <Row key={g.id} last={i === scored.length - 1} title={tr(g.zh, g.en)}
                  subtitle={tr(`玩了 ${r.plays} 次，${r.last ? `上次 ${r.last.score}，` : ''}${r.lower ? '越小越好' : '越大越好'}`, `${r.plays} plays, ${r.last ? `last ${r.last.score}, ` : ''}${r.lower ? 'lower is better' : 'higher is better'}`)}
                  trailing={<T v="headline">{r.best}</T>} />;
              })}
            </Group>
          ) : <T v="subhead" color={c.secondary}>{tr('玩一局就會出現在這裡。', 'Play a round and it shows up here.')}</T>}
        </Section>
        <InstallCard style={{ marginTop: 26 }} />
        <Section title={tr('語言', 'Language')}>
          <Segmented value={lang} onChange={setLang} items={[{ id: 'zh', label: '繁體中文' }, { id: 'en', label: 'English' }]} />
        </Section>
        <Button style={{ marginTop: 28 }} kind="secondary" icon={user ? 'logOut' : 'logIn'} title={user ? tr('登出', 'Log Out') : tr('登入／註冊', 'Log In / Sign Up')} onPress={() => (user ? signOut() : setAuthOpen(true))} />
      </Page>
    </View>
  );
}

exports.default = ProfileScreen;
});

// ---- state/store
__d('state/store', function (exports, __r) {
const React = E0.default;
const { createContext, useCallback, useContext, useEffect, useMemo, useState } = E0;
const AsyncStorage = E5.default;
const { api, setToken } = __r('lib/api');
const { GAMES } = __r('games/catalog');

const KEY = 'letsplay:state:v2';
const SESSION_KEY = 'letsplay:session:v1';
const Ctx = createContext(null);
const useStore = () => useContext(Ctx);

function StoreProvider({ children }) {
  const [state, setState] = useState({ lang: 'zh', favorites: [], played: {}, records: {}, skippedAuth: false, installDismissed: false });
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [dbError, setDbError] = useState(null);
  const uid = session?.user?.id;

  const saveSession = useCallback(next => {
    setToken(next?.token ?? null);
    setSession(next);
    (next ? AsyncStorage.setItem(SESSION_KEY, JSON.stringify(next)) : AsyncStorage.removeItem(SESSION_KEY)).catch(() => {});
  }, []);
  const endSession = useCallback(() => {
    saveSession(null);
    setState(s => ({ ...s, favorites: [], played: {}, records: {} }));
  }, [saveSession]);
  // An expired token signs the player out. Any other failure just shows as a sync problem.
  const report = useCallback(e => {
    if (e.status === 401) { endSession(); return; }
    setDbError(e.message);
  }, [endSession]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => { if (raw) setState(s => ({ ...s, ...JSON.parse(raw) })); }).catch(() => {}).finally(() => setReady(true));
    // The saved session opens the app offline; the server gets the final say once it can be reached.
    AsyncStorage.getItem(SESSION_KEY).then(raw => {
      if (!raw) return;
      const saved = JSON.parse(raw);
      setToken(saved.token);
      setSession(saved);
      api('/me').then(({ user }) => saveSession({ token: saved.token, user })).catch(e => { if (e.status === 401) endSession(); });
    }).catch(() => {});
  }, []);
  useEffect(() => { if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {}); }, [state, ready]);

  // Signed in: the database is the source of truth. Guests keep data on this device only.
  useEffect(() => {
    if (!uid) return;
    api('/me/state').then(({ favorites, plays, records: rows }) => {
      setDbError(null);
      const played = {};
      plays.forEach(p => { played[p.game_id] = played[p.game_id] || new Date(p.played_at).getTime(); });
      const records = {};
      setState(s => {
        (rows || []).forEach(r => {
          const remote = r.last != null ? { score: r.last, at: new Date(r.last_at).getTime() } : null;
          const local = s.records[r.game_id]?.last;
          records[r.game_id] = { best: r.best, lower: r.lower, plays: r.plays, last: local && (!remote || local.at > remote.at) ? local : remote };
        });
        return { ...s, favorites, played, records };
      });
    }).catch(report);
  }, [uid]);

  const toggleFavorite = useCallback(id => {
    const on = state.favorites.includes(id);
    setState(s => ({ ...s, favorites: on ? s.favorites.filter(f => f !== id) : [id, ...s.favorites] }));
    if (uid) {
      api(`/me/favorites/${id}`, { method: on ? 'DELETE' : 'PUT' }).then(() => setDbError(null)).catch(report);
    }
  }, [uid, state.favorites, report]);

  // A number beats the saved best only in the game's own direction: lower for moves and times, higher for points.
  const markPlayed = useCallback((id, won, score, lower) => {
    const hasScore = Number.isInteger(score);
    setState(s => {
      const prev = s.records[id] || { best: null, lower: false, plays: 0, last: null };
      const beats = hasScore && (prev.best == null || (lower ? score < prev.best : score > prev.best));
      const next = { best: beats ? score : prev.best, lower: hasScore ? !!lower : prev.lower, plays: prev.plays + 1, last: hasScore ? { score, at: Date.now() } : prev.last };
      return { ...s, played: { ...s.played, [id]: Date.now() }, records: { ...s.records, [id]: next } };
    });
    if (uid) api('/me/plays', { method: 'POST', body: { game: id, won, ...(hasScore ? { score, lower: !!lower } : null) } }).then(() => setDbError(null)).catch(report);
  }, [uid, report]);

  // For the undecided who crave novelty: never-played first, then whatever was played longest ago.
  const pickFresh = useCallback((exclude, type) => {
    const pool = GAMES.filter(g => g.id !== exclude && (!type || g.type === type));
    const never = pool.filter(g => !state.played[g.id]);
    const from = never.length ? never : [...pool].sort((a, b) => state.played[a.id] - state.played[b.id]).slice(0, Math.ceil(pool.length / 3));
    return from[Math.floor(Math.random() * from.length)];
  }, [state.played]);

  const authenticate = (path, body) => api(path, { method: 'POST', body }).then(saveSession);
  const signIn = (email, password) => authenticate('/auth/login', { email, password });
  const signUp = (email, password, nickname) => authenticate('/auth/signup', { email, password, nickname });

  const user = session?.user ? { id: uid, email: session.user.email, name: session.user.nickname } : null;

  const value = useMemo(() => ({
    ...state, ready, user, dbError, zh: state.lang === 'zh', tr: (z, e) => (state.lang === 'zh' ? z : e),
    setLang: lang => setState(s => ({ ...s, lang })), skipAuth: () => setState(s => ({ ...s, skippedAuth: true })),
    dismissInstall: () => setState(s => ({ ...s, installDismissed: true })),
    toggleFavorite, markPlayed, pickFresh, signIn, signUp, signOut: endSession, authOpen, setAuthOpen,
  }), [state, ready, session, dbError, toggleFavorite, markPlayed, pickFresh, endSession, authOpen]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

exports.useStore = useStore;
exports.StoreProvider = StoreProvider;
});

// ---- theme/tokens
__d('theme/tokens', function (exports, __r) {
const { useColorScheme } = E1;

// Contrast (WCAG) checked per pair: every text colour is at least 4.5:1 on its surface.
const light = {
  bg: '#F7F6F0', surface: '#FFFFFF', surface2: '#EEEDE3', edge: '#E3E1D5', separator: '#ECEAE0',
  label: '#23241C', secondary: '#5F6156', placeholder: '#6F7166',
  accent: '#555C2C', onAccent: '#FFFFFF', accentTint: '#E9EBD5',
  success: '#2A7044', successTint: '#E3F1E6', danger: '#B03A2A', dangerTint: '#F9E8E4',
  puzzle: '#555C2C', puzzleTint: '#E9EBD5', challenge: '#94570F', challengeTint: '#F6E8D2', paw: '#EAD8BA', scrim: 'rgba(25,26,15,0.42)',
};
const dark = {
  bg: '#13140E', surface: '#1D1E17', surface2: '#2A2B21', edge: '#32332A', separator: '#2B2C23',
  label: '#F4F3EA', secondary: '#B3B4A5', placeholder: '#95978B',
  accent: '#C4CD80', onAccent: '#1D1F0E', accentTint: '#2F331A',
  success: '#7DD098', successTint: '#183223', danger: '#FF9382', dangerTint: '#3B1E19',
  puzzle: '#C4CD80', puzzleTint: '#2F331A', challenge: '#E9B56C', challengeTint: '#392B16', paw: '#EAD8BA', scrim: 'rgba(0,0,0,0.6)',
};

const useColors = () => (useColorScheme() === 'dark' ? dark : light);

const type = {
  largeTitle: { fontSize: 32, lineHeight: 39, fontWeight: '700', letterSpacing: -0.6 },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '700', letterSpacing: -0.4 },
  title2: { fontSize: 20, lineHeight: 26, fontWeight: '700', letterSpacing: -0.2 },
  headline: { fontSize: 17, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 25 },
  subhead: { fontSize: 15, lineHeight: 21 },
  footnote: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
};

exports.useColors = useColors;
exports.type = type;
});

export default __r('App').default;
