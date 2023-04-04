const getTamas = async () => {
    const res = await fetch('/tamas');
    console.log(await res.json());
}
