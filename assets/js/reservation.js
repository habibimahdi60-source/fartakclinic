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
    document.getElementById('f-name').value = data.name;
    document.getElementById('f-phone').value = data.phone;
    document.getElementById('f-service').value = data.service;
    document.getElementById('f-next').value = new URL('reservation-done.html', window.location.href).href;

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

    pf.addEventListener('submit', function (e) {
      perr.hidden = true;
      if (!file.files[0]) {
        e.preventDefault();
        return showError(perr, 'لطفاً اسکرین‌شات واریز بیعانه را بارگذاری کنید.');
      }
      var b = document.getElementById('pay-submit');
      b.disabled = true; b.textContent = 'در حال ارسال...';
    });
  }
})();
