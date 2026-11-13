
let keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];
let menuDibuka = null;

function ambil(id) {
    return document.getElementById(id);
}

function cariKartu(id) {
    return document.querySelector('.kartu[data-id="' + id + '"]');
}

function rupiah(angka) {
    return "Rp" + String(angka).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function sudahMasuk() {
    return localStorage.getItem("masuk") === "ya";
}

// ===== PENCARIAN & KATALOG =====
const inputCari = ambil("input-cari");
if (inputCari) {
    inputCari.addEventListener("input", function () {
        location.hash = "#/";
        tampilkanKatalog();
    });
}

const formCari = ambil("form-cari");
if (formCari) {
    formCari.addEventListener("submit", function (e) {
        e.preventDefault();
    });
}

const tombolKeluar = ambil("tombol-keluar");
if (tombolKeluar) {
    tombolKeluar.addEventListener("click", function () {
        localStorage.removeItem("masuk");
        location.hash = "#/login"
    });
}

function tampilkanKatalog() {
    const radioChecked = document.querySelector('input[name="kategori"]:checked');
    const kategori = radioChecked ? radioChecked.value : "semua";
    const kata = inputCari ? inputCari.value.trim().toLowerCase() : "";

    document.querySelectorAll("#grid-produk .kartu").forEach(function (k) {
        k.hidden = !(
            (kategori === "semua" || k.dataset.kategori === kategori) &&
            k.textContent.toLowerCase().includes(kata)
        );
    });
}

const halamanKatalogEl = ambil("halaman-katalog");
if (halamanKatalogEl) {
    halamanKatalogEl.addEventListener("change", tampilkanKatalog);
}

// ===== LOGIN =====
const USERNAME = "user";
const PASSWORD = "1234";

const formLogin = ambil("form-login");
if (formLogin) {
    formLogin.addEventListener("submit", function (e) {
        e.preventDefault();

        const inputUser = ambil("isian-username").value.trim().toLowerCase();
        const inputPass = ambil("isian-password").value;

        const benar = (inputUser === USERNAME && inputPass === PASSWORD);
        const elSalah = ambil("login-salah");
        if (elSalah) elSalah.hidden = benar;

        if (benar) {
            localStorage.setItem("masuk", "ya");
            this.reset();
            location.hash = "#/";
            aturHalaman();
        }
    });
}

// ===== DETAIL PRODUK =====
function tampilkanDetail(id) {
    menuDibuka = cariKartu(id);
    if (!menuDibuka) return;

    ambil("detail-tidak-ada").hidden = true;
    ambil("isi-detail").hidden = false;

    ambil("detail-gambar").src = menuDibuka.querySelector(".foto").src;
    ambil("detail-nama").textContent = menuDibuka.dataset.nama;
    ambil("detail-deskripsi").textContent = menuDibuka.dataset.deskripsi;
    ambil("isian-jumlah").value = 1;

    hitungKasir();
}

function hitungKasir() {
    if (!menuDibuka) return;
    const kolom = ambil("isian-jumlah");
    const jumlah = Math.max(1, Math.floor(Number(kolom.value)) || 1);
    kolom.value = jumlah;

    const harga = Number(menuDibuka.dataset.harga);
    const subtotal = harga * jumlah;

    ambil("kasir-nama").textContent = menuDibuka.dataset.nama;
    ambil("kasir-harga").textContent = rupiah(harga);

    document.querySelectorAll(".total-teks").forEach(function (el) {
        el.textContent = rupiah(subtotal);
    });

    ambil("tombol-kurang").disabled = jumlah <= 1;
}

const tombolKurang = ambil("tombol-kurang");
if (tombolKurang) {
    tombolKurang.addEventListener("click", function () {
        ambil("isian-jumlah").value = Math.max(1, Number(ambil("isian-jumlah").value) - 1);
        hitungKasir();
    });
}

const tombolTambah = ambil("tombol-tambah");
if (tombolTambah) {
    tombolTambah.addEventListener("click", function () {
        ambil("isian-jumlah").value = Number(ambil("isian-jumlah").value || 0) + 1;
        hitungKasir();
    });
}

const isianJumlah = ambil("isian-jumlah");
if (isianJumlah) {
    isianJumlah.addEventListener("input", hitungKasir);
}

function masukKeranjang(tambah) {
    if (!menuDibuka) return;
    const id = Number(menuDibuka.dataset.id);
    const jumlah = Number(ambil("isian-jumlah").value);
    const item = keranjang.find(i => i.id === id);

    if (item) {
        item.jumlah = tambah ? item.jumlah + jumlah : jumlah;
    } else {
        keranjang.push({ id: id, jumlah: jumlah, harga: Number(menuDibuka.dataset.harga) });
    }
    simpanKeranjang();
}

const tombolKeranjang = ambil("tombol-keranjang");
if (tombolKeranjang) {
    tombolKeranjang.addEventListener("click", () => masukKeranjang(true));
}

const tombolPesan = ambil("tombol-pesan");
if (tombolPesan) {
    tombolPesan.addEventListener("click", () => {
        masukKeranjang(false);
        location.hash = "#/checkout";
    });
}

// ===== NAVIGASI HALAMAN =====
function aturHalaman() {
    const hash = location.hash || "#/";

    const elLogin = ambil("halaman-login");
    const elKatalog = ambil("halaman-katalog");
    const elDetail = ambil("halaman-detail");
    const elKeranjang = ambil("halaman-keranjang");
    const elCheckout = ambil("halaman-checkout");
    const elSukses = ambil("halaman-sukses");

    const navMasuk = ambil("nav-masuk");
    const tombolKeluar = ambil("tombol-keluar");

    // Jika BELUM masuk
    if (!sudahMasuk()) {
        if (navMasuk) navMasuk.style.display = "inline-flex";
        if (tombolKeluar) tombolKeluar.style.display = "none";

        document.body.dataset.halaman = "login";

        if (elLogin) elLogin.hidden = false;
        if (elKatalog) elKatalog.hidden = true;
        if (elDetail) elDetail.hidden = true;
        if (elKeranjang) elKeranjang.hidden = true;
        if (elCheckout) elCheckout.hidden = true;
        if (elSukses) elSukses.hidden = true;
        return;
    }

    // Jika SUDAH masuk
    if (navMasuk) navMasuk.style.display = "none";
    if (tombolKeluar) tombolKeluar.style.display = "inline-flex";

    if (elLogin) elLogin.hidden = true;
    if (elKatalog) elKatalog.hidden = true;
    if (elDetail) elDetail.hidden = true;
    if (elKeranjang) elKeranjang.hidden = true;
    if (elCheckout) elCheckout.hidden = true;
    if (elSukses) elSukses.hidden = true;

    if (hash === "#/keranjang") {
        document.body.dataset.halaman = "keranjang";
        if (elKeranjang) elKeranjang.hidden = false;
        tampilkanKeranjang();
    } else if (hash === "#/checkout") {
        document.body.dataset.halaman = "checkout";
        if (elCheckout) elCheckout.hidden = false;
        tampilkanCheckout();
    } else if (hash === "#/sukses") {
        document.body.dataset.halaman = "sukses";
        if (elSukses) elSukses.hidden = false;
        tampilkanSukses();
    } else if (hash.startsWith("#/detail/")) {
        document.body.dataset.halaman = "detail";
        const match = hash.match(/^#\/detail\/(\d+)$/);
        if (match && elDetail) {
            elDetail.hidden = false;
            tampilkanDetail(match[1]);
        }
    } else {
        document.body.dataset.halaman = "katalog";
        if (elKatalog) elKatalog.hidden = false;
        tampilkanKatalog();
    }
}

window.addEventListener("hashchange", aturHalaman);
window.addEventListener("DOMContentLoaded", aturHalaman);

// ===== KERANJANG & CHECKOUT =====
function jumlahBarang() {
    return keranjang.reduce((t, i) => t + i.jumlah, 0);
}

function totalHarga() {
    return keranjang.reduce((t, i) => t + i.harga * i.jumlah, 0);
}

function simpanKeranjang() {
    localStorage.setItem("keranjang", JSON.stringify(keranjang));
    const lencana = ambil("lencana-keranjang");
    if (lencana) lencana.textContent = jumlahBarang();
}

function isiBaris(wadah, daftar) {
    if (!wadah) return;
    wadah.replaceChildren();
    daftar.forEach(item => {
        const menu = cariKartu(item.id);
        if (!menu) return;
        const baris = ambil("templat-baris").content.cloneNode(true);
        baris.querySelector(".baris-keranjang").dataset.id = item.id;
        baris.querySelector(".foto").src = menu.querySelector(".foto").src;
        baris.querySelector(".baris-info a").textContent = menu.dataset.nama;
        baris.querySelector(".baris-info a").href = "#/detail/" + item.id;
        baris.querySelector(".baris-info p").textContent = rupiah(item.harga);
        baris.querySelector(".jumlah").textContent = item.jumlah;
        baris.querySelector('[data-aksi="kurang"]').disabled = item.jumlah <= 1;
        baris.querySelector(".baris-subtotal").textContent = rupiah(item.harga * item.jumlah);
        wadah.append(baris);
    });
}

function tampilkanKeranjang() {
    isiBaris(ambil("daftar-keranjang"), keranjang);
    ambil("keranjang-jumlah").textContent = jumlahBarang();
    ambil("keranjang-subtotal").textContent = rupiah(totalHarga());
    simpanKeranjang();
}

const daftarKeranjangEl = ambil("daftar-keranjang");
if (daftarKeranjangEl) {
    daftarKeranjangEl.addEventListener("click", function (e) {
        const aksi = e.target.dataset.aksi;
        if (!aksi) return;
        const parentId = e.target.closest("[data-id]");
        if (!parentId) return;
        const id = Number(parentId.dataset.id);
        const item = keranjang.find(i => i.id === id);
        if (!item) return;

        if (aksi === "kurang") item.jumlah -= 1;
        if (aksi === "tambah") item.jumlah += 1;
        if (aksi === "hapus") keranjang = keranjang.filter(i => i !== item);

        simpanKeranjang();
        tampilkanKeranjang();
    });
}

function tampilkanCheckout() {
    isiBaris(ambil("ringkasan-checkout"), keranjang);
    const totalEl = ambil("checkout-total");
    if (totalEl) totalEl.textContent = rupiah(totalHarga());
}

const formCheckout = ambil("form-checkout");
if (formCheckout) {
    formCheckout.addEventListener("submit", function (e) {
        e.preventDefault();
        const pesanan = {
            nama: ambil("isian-nama").value.trim(),
            barang: [...keranjang],
            total: totalHarga(),
        };
        localStorage.setItem("pesananTerakhir", JSON.stringify(pesanan));
        keranjang = [];
        simpanKeranjang();
        this.reset();
        location.hash = "#/sukses";
    });
}

function tampilkanSukses() {
    const dataPesanan = JSON.parse(localStorage.getItem("pesananTerakhir"));
    const adaData = !!dataPesanan;

    ambil("sukses-tidak-ada").hidden = adaData;
    ambil("isi-sukses").hidden = !adaData;

    if (adaData) {
        ambil("sukses-pemesan").textContent = "Terima kasih, " + dataPesanan.nama + ", pesanan Anda sedang diproses.";
        isiBaris(ambil("sukses-daftar"), dataPesanan.barang);
        ambil("sukses-total").textContent = rupiah(dataPesanan.total);
    }
}