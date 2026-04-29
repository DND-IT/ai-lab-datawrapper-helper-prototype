async function testDW() {
  const token = "invalid";
  try {
    const res = await fetch("https://api.datawrapper.de/v3/charts", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });
    console.log("Status:", res.status);
    console.log("Response:", await res.text());
  } catch(e) {
    console.error(e);
  }
}
testDW();
