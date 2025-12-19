const AsciiKeyboard = () => {
  return (
    <div className="keyboard-container">
      <pre className="keyboard-ascii">
{`┌─────────────────────────────────────────────────────────────┐
│  ESC   F1  F2  F3  F4  F5  F6  F7     │    ◉ AIDEN-KB 84   │
├─────────────────────────────────────────────────────────────┤
│  \`  1  2  3  4  5  6  7  8  9  0  -  =  ⌫  │ INS │ HOM │ PU │
│  ⇥   Q  W  E  R  T  Y  U  I  O  P  [  ]  \\ │ DEL │ END │ PD │
└─────────────────────────────────────────────────────────────┘`}
      </pre>
    </div>
  );
};

export default AsciiKeyboard;
