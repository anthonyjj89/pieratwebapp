export default function Home() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Hello World</h1>
      <p>Testing minimal deployment</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}
