async function testDW() {
  const token = "Es3XqKUhWJmexi9e68TkwvpwegMlHSDdXyXsIGfahxSRAFLgz1S8JyhgN9V9OoWr";
  try {
    const res = await fetch("https://api.datawrapper.de/v3/me", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    console.log("Status:", res.status);
    console.log("Response:", await res.text());
  } catch(e) {
    console.error(e);
  }
}
testDW();
