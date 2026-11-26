// Fartak — booking flow (no login). Step 1 -> payment.html -> email via FormSubmit
(function () {
  var KEY = 'fartak-reservation';

  function normDigits(s) {
    return String(s).replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); })
                    .replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); });
  }
  function showError(el, msg) { el.textContent = msg; el.hidden = false; }

  /* ---------- step 1 ---------- */
  var rf = document.getElementById('reserve-form');
  if (rf) {
    var err = document.getElementById('reserve-error');
    rf.addEventListener('submit', function (e) {
      e.preventDefault();
      err.hidden = true;
      var first = rf.first.value.trim(), last = rf.last.value.trim();
      var phone = normDigits(rf.phone.value).replace(/[\s\-]/g, '');
      var service = rf.service.value;
      if (!first || !last) return showError(err, 'لطفاً نام و نام خانوادگی را وارد کنید.');
      if (!/^09\d{9}$/.test(phone)) return showError(err, 'شماره تلفن همراه را به‌صورت صحیح وارد کنید (مثلاً 09123456789).');
      if (!service) return showError(err, 'لطفاً خدمت مورد نظر را انتخاب کنید.');
      try {
        sessionStorage.setItem(KEY, JSON.stringify({ name: first + ' ' + last, phone: phone, service: service }));
      } catch (x) {}
      window.location.href = 'payment.html';
    });
  }

  /* ---------- step 2 ---------- */
  var pf = document.getElementById('pay-form');
  if (pf) {
    var data = null;
    try { data = JSON.parse(sessionStorage.getItem(KEY)); } catch (x) {}
    if (!data || !data.name) { window.location.replace('reservation.html'); return; }

    document.getElementById('s-name').textContent = data.name;
    document.getElementById('s-phone').textContent = data.phone;
    document.getElementById('s-service').textContent = data.service;
    document.getElementById('summary').hidden = false;

    var copyBtn = document.getElementById('copy-card');
    copyBtn.addEventListener('click', function () {
      var num = copyBtn.dataset.card;
      var done = function () {
        copyBtn.textContent = 'کپی شد ✓';
        setTimeout(function () { copyBtn.textContent = 'کپی شماره کارت'; }, 2000);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(num).then(done, done);
      } else {
        var t = document.createElement('textarea');
        t.value = num; document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); } catch (x) {}
        document.body.removeChild(t); done();
      }
    });

    var file = document.getElementById('receipt');
    var prev = document.getElementById('upload-preview');
    var txt = document.getElementById('upload-text');
    var perr = document.getElementById('pay-error');
    var MAX = 4.5 * 1024 * 1024;

    file.addEventListener('change', function () {
      perr.hidden = true;
      var f = file.files[0];
      if (!f) { prev.hidden = true; txt.hidden = false; return; }
      if (!/^image\//.test(f.type)) {
        file.value = ''; prev.hidden = true; txt.hidden = false;
        return showError(perr, 'لطفاً فقط تصویر (اسکرین‌شات) انتخاب کنید.');
      }
      if (f.size > MAX) {
        file.value = ''; prev.hidden = true; txt.hidden = false;
        return showError(perr, 'حجم تصویر بیش از حد مجاز است (حداکثر ۴ مگابایت).');
      }
      prev.src = URL.createObjectURL(f);
      prev.hidden = false; txt.hidden = true;
    });

    var fb = document.getElementById('send-fallback');
    var waLink = document.getElementById('fb-wa');
    waLink.href = 'https://wa.me/989933951614?text=' + encodeURIComponent(
      'سلام، درخواست رزرو نوبت:\nنام: ' + data.name + '\nشماره: ' + data.phone + '\nخدمت: ' + data.service +
      '\nبیعانه ۵۰۰ هزار تومان واریز شد. اسکرین‌شات واریز را در ادامه ارسال می‌کنم.');

    pf.addEventListener('submit', function (e) {
      e.preventDefault();
      perr.hidden = true; fb.hidden = true;
      var f = file.files[0];
      if (!f) return showError(perr, 'لطفاً اسکرین‌شات واریز بیعانه را بارگذاری کنید.');

      var b = document.getElementById('pay-submit');
      b.disabled = true; b.textContent = 'در حال ارسال...';

      var fd = new FormData();
      fd.append('name', data.name);
      fd.append('phone', data.phone);
      fd.append('service', data.service);
      fd.append('website', pf.elements['website'].value);
      fd.append('attachment', f);

      var ctrl = new AbortController();
      var timer = setTimeout(function () { ctrl.abort(); }, 30000);

      fetch('send-reservation.php', { method: 'POST', body: fd, signal: ctrl.signal })
        .then(function (r) {
          return r.text().then(function (txt) {
            var j = null;
            try { j = JSON.parse(txt); } catch (x) {}
            if (r.ok && j && j.ok) return;
            throw new Error('send failed');
          });
        })
        .then(function () { window.location.href = 'reservation-done.html'; })
        .catch(function () {
          b.disabled = false; b.textContent = 'تلاش مجدد برای ارسال';
          fb.hidden = false;
          fb.scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .then(function () { clearTimeout(timer); });
    });
  }
})();
