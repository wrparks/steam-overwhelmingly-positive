(() => {
  const table = document.getElementById('games-table');
  if (!table) return;
  const body = table.querySelector('tbody');
  const controls = ['q', 'tag', 'min-reviews', 'sort', 'order'].map(id => document.getElementById(id));
  const [q, tag, min, sort, order] = controls;
  const count = document.getElementById('result-count');
  function update() {
    const query = q.value.trim().toLowerCase();
    const selectedTag = tag.value;
    const minReviews = Number(min.value || 0);
    const rows = [...body.rows];
    rows.forEach(row => {
      const visible = row.dataset.name.toLowerCase().includes(query) &&
        (!selectedTag || row.dataset.tags.split('|').includes(selectedTag)) &&
        Number(row.dataset.reviews) >= minReviews;
      row.hidden = !visible;
    });
    const visibleRows = rows.filter(row => !row.hidden);
    const key = sort.value;
    visibleRows.sort((a, b) => {
      let av = a.dataset[key] || '', bv = b.dataset[key] || '';
      if (key === 'name') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      else { av = Number(av) || 0; bv = Number(bv) || 0; }
      const result = av < bv ? -1 : av > bv ? 1 : 0;
      return order.value === 'desc' ? -result : result;
    });
    visibleRows.forEach(row => body.appendChild(row));
    count.textContent = `${visibleRows.length.toLocaleString()} games shown`;
  }
  controls.forEach(control => control.addEventListener('input', update));
  update();
})();
