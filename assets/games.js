(() => {
  function initGamesTable() {
    const table = document.getElementById('games-table');
    if (!table) return;

    const body = table.tBodies && table.tBodies[0];
    if (!body) return;

    const q = document.getElementById('q');
    const tag = document.getElementById('tag');
    const min = document.getElementById('min-reviews');
    const sort = document.getElementById('sort');
    const order = document.getElementById('order');
    const count = document.getElementById('result-count');
    if (!q || !tag || !min || !sort || !order) return;

    // Keep a stable reference to every original row. Sorting changes DOM order,
    // but filtering and subsequent sorts always operate on the complete set.
    const rows = Array.from(body.rows);
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: 'base'
    });

    function matches(row) {
      const name = (row.dataset.name || '').toLocaleLowerCase();
      const tags = (row.dataset.tags || '')
        .split('|')
        .map(value => value.trim().toLocaleLowerCase());
      const query = q.value.trim().toLocaleLowerCase();
      const selectedTag = tag.value.trim().toLocaleLowerCase();
      const minReviews = Number(min.value || 0);
      const reviews = Number(row.dataset.reviews || 0);

      return name.includes(query) &&
        (!selectedTag || tags.includes(selectedTag)) &&
        reviews >= minReviews;
    }

    function compareRows(a, b, key, direction) {
      const aValue = a.dataset[key] || '';
      const bValue = b.dataset[key] || '';
      const multiplier = direction === 'desc' ? -1 : 1;

      if (key === 'date') {
        const aTime = aValue ? Date.parse(aValue) : NaN;
        const bTime = bValue ? Date.parse(bValue) : NaN;
        const aValid = Number.isFinite(aTime);
        const bValid = Number.isFinite(bTime);

        // Unknown dates always remain at the bottom, whichever direction is used.
        if (!aValid && !bValid) return 0;
        if (!aValid) return 1;
        if (!bValid) return -1;
        return (aTime - bTime) * multiplier;
      }

      if (key === 'name') {
        return collator.compare(aValue, bValue) * multiplier;
      }

      const aNumber = Number(aValue);
      const bNumber = Number(bValue);
      return ((Number.isFinite(aNumber) ? aNumber : 0) -
        (Number.isFinite(bNumber) ? bNumber : 0)) * multiplier;
    }

    function update() {
      const key = sort.value;
      const direction = order.value;
      const visibleCount = rows.reduce((total, row) => {
        const visible = matches(row);
        row.hidden = !visible;
        // Explicitly enforce hidden state because mobile CSS changes table rows
        // to display:grid, which can override the browser's [hidden] styling.
        row.style.display = visible ? '' : 'none';
        return total + (visible ? 1 : 0);
      }, 0);

      rows.sort((a, b) => compareRows(a, b, key, direction));
      rows.forEach(row => body.appendChild(row));

      if (count) {
        count.textContent =
          `${visibleCount.toLocaleString()} of ${rows.length.toLocaleString()} games shown`;
      }
    }

    [q, tag, min, sort, order].forEach(control => {
      control.addEventListener('input', update);
      control.addEventListener('change', update);
    });

    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGamesTable, { once: true });
  } else {
    initGamesTable();
  }
})();
