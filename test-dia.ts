async function run() {
  const r = await fetch("http://localhost:3000/api/diagnostic");
  console.log(await r.text());
}
run();
