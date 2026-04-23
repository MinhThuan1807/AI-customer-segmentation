# 🎓 Chủ đề 17: Phân cụm khách hàng thương mại điện tử

## Customer Segmentation với K-Means Clustering

---

## 📋 PHÂN CÔNG 5 NGƯỜI

### ✍️ 3 Người soạn nội dung & script

| Người       | Phần soạn                                                              | Output bàn giao cho người làm slide   |
| ----------- | ---------------------------------------------------------------------- | ------------------------------------- |
| **Người 1** | Giới thiệu đề tài · Bài toán thực tế · Tổng quan hệ thống              | Script + bullet points cho Slide 1–4  |
| **Người 2** | Lý thuyết K-Means · Unsupervised Learning · Đặc trưng dữ liệu          | Script + bullet points cho Slide 5–8  |
| **Người 3** | Dữ liệu · Tiền xử lý · Demo · Kết quả · Ứng dụng kinh doanh · Kết luận | Script + bullet points cho Slide 9–20 |

> 📝 Mỗi người soạn cần bàn giao: tiêu đề slide, các bullet point chính, script nói (~3–5 câu/slide), và ghi chú hình ảnh/biểu đồ cần có.

### 🎨 2 Người làm slide (dựa theo nội dung được bàn giao)

| Người       | Nhiệm vụ                                    | Nhận nội dung từ                     |
| ----------- | ------------------------------------------- | ------------------------------------ |
| **Người 4** | Dựng Slide 1–10 trên Canva / Google Slides  | Người 1 + Người 2 + phần đầu Người 3 |
| **Người 5** | Dựng Slide 11–20 trên Canva / Google Slides | Phần sau Người 3                     |

> 💡 Người làm slide không tự thêm nội dung — chỉ trình bày đúng theo bản soạn. Màu chủ đạo `#2563EB` + trắng, tối đa 5–6 dòng/slide, ưu tiên hình ảnh hơn chữ.

---

## 🎤 GỢI Ý NỘI DUNG CHI TIẾT

> ⚠️ Đây là **gợi ý định hướng**, không phải nội dung có sẵn. Mỗi người cần tự nghiên cứu, viết script và bullet points theo cách hiểu của mình.

---

### 👤 NGƯỜI 1 — Giới thiệu đề tài & Tổng quan hệ thống

**Thời gian: ~3–4 phút | Slide 1–4**

---

#### Slide 1 — Trang bìa

**Cần có:**

- Tiêu đề đề tài, tên nhóm, môn học, ngày thuyết trình

**Gợi ý script:** Câu chào mở đầu, giới thiệu ngắn gọn chủ đề nhóm sẽ trình bày.

---

#### Slide 2 — Đặt vấn đề

**Cần trình bày:**

- Bối cảnh thực tế: các sàn thương mại điện tử có hàng triệu khách hàng
- Vấn đề đặt ra: làm sao phân biệt các nhóm khách hàng khác nhau?
- Tại sao không thể xử lý thủ công?

**Gợi ý:** Lấy ví dụ từ Shopee, Lazada, Tiki. Đặt câu hỏi mở để dẫn dắt vào đề tài.

---

#### Slide 3 — Mục tiêu đề tài

**Cần trình bày:**

- Đề tài hướng đến giải quyết vấn đề gì?
- Có bao nhiêu mục tiêu chính? (gợi ý: ~4 mục tiêu)
- Kết quả kỳ vọng là gì?

**Gợi ý:** Trình bày dạng danh sách ngắn gọn, mỗi mục 1 câu.

---

#### Slide 4 — Tổng quan hệ thống

**Cần trình bày:**

- Hệ thống gồm những thành phần nào? (Frontend, Backend, ML)
- Luồng hoạt động từ đầu đến cuối là gì?
- Công nghệ sử dụng là gì?

**Gợi ý:** Vẽ sơ đồ luồng đơn giản thay vì liệt kê chữ. Tham khảo file `be/main.py` và `fe/src/app/page.tsx` để hiểu kiến trúc thực tế.

---

### 👤 NGƯỜI 2 — Lý thuyết K-Means & Unsupervised Learning

**Thời gian: ~4–5 phút | Slide 5–8**

---

#### Slide 5 — Học không giám sát là gì?

**Cần trình bày:**

- Supervised Learning và Unsupervised Learning khác nhau như thế nào?
- Unsupervised Learning dùng khi nào?
- Clustering là gì trong bức tranh tổng thể của ML?

**Gợi ý:** Dùng bảng so sánh 2 cột. Lấy ví dụ dễ hiểu (spam filter vs phân nhóm khách hàng).

---

#### Slide 6 — Thuật toán K-Means

**Cần trình bày:**

- K-Means hoạt động theo mấy bước? Mỗi bước làm gì?
- Khoảng cách Euclidean là gì?
- Điều kiện dừng của thuật toán là gì?

**Gợi ý:** Tìm hình minh họa animation K-Means trên Google/Wikipedia để đưa vào slide. Viết công thức toán học nếu có thể.

---

#### Slide 7 — Elbow Method — Chọn K tối ưu

**Cần trình bày:**

- Vấn đề: tại sao cần chọn K? Chọn sai thì sao?
- WCSS là gì? Tính như thế nào?
- Đọc biểu đồ Elbow như thế nào để chọn K?

**Gợi ý:** Chụp ảnh biểu đồ Elbow từ ứng dụng thực tế của nhóm để minh họa.

---

#### Slide 8 — Các đặc trưng dữ liệu sử dụng

**Cần trình bày:**

- Dữ liệu đầu vào gồm những cột nào?
- Mỗi đặc trưng có ý nghĩa gì trong bài toán phân cụm?
- Phạm vi giá trị của từng đặc trưng?

**Gợi ý:** Mở file `be/customers_500_clustered.csv` để xem cấu trúc thực tế, sau đó trình bày dạng bảng.

---

### 👤 NGƯỜI 3 — Dữ liệu, Tiền xử lý, Demo, Kết quả & Kết luận

**Thời gian: ~8–10 phút | Slide 9–20**

---

#### Slide 9 — Nguồn dữ liệu

**Cần trình bày:**

- Dữ liệu lấy từ đâu? Có bao nhiêu bản ghi?
- Tại sao chọn bộ dữ liệu này?
- Dữ liệu có đặc điểm gì nổi bật?

**Gợi ý:** Hiển thị vài dòng đầu của file CSV dạng bảng. Nêu số lượng 3 bộ dữ liệu (300/500/1000).

---

#### Slide 10 — Pipeline tiền xử lý

**Cần trình bày:**

- Dữ liệu thô cần qua những bước xử lý nào trước khi đưa vào K-Means?
- Mỗi bước giải quyết vấn đề gì?

**Gợi ý:** Tham khảo file `be/ml/preprocess.py` để hiểu các bước thực tế. Vẽ sơ đồ pipeline dạng mũi tên.

---

#### Slide 11 — Tại sao cần StandardScaler?

**Cần trình bày:**

- Vấn đề xảy ra nếu không chuẩn hóa dữ liệu?
- StandardScaler làm gì với dữ liệu?
- Kết quả trước và sau khi scale khác nhau như thế nào?

**Gợi ý:** Lấy ví dụ cụ thể với số liệu thực từ dataset (Income vs SpendingScore). Vẽ hình minh họa trước/sau.

---

#### Slide 12 — PCA để trực quan hóa

**Cần trình bày:**

- Tại sao cần PCA trong bài toán này?
- PCA hoạt động như thế nào (giải thích đơn giản)?
- Kết quả sau PCA trông như thế nào?

**Gợi ý:** Không cần đi sâu toán học PCA — tập trung vào mục đích sử dụng. Chụp ảnh scatter plot từ ứng dụng.

---

#### Slide 13 — Giao diện ứng dụng

**Cần trình bày:**

- Ứng dụng có những tính năng gì?
- Người dùng thao tác như thế nào?
- Giao diện được xây dựng bằng công nghệ gì?

**Gợi ý:** Chụp screenshot giao diện thực tế. Chú thích từng khu vực chức năng trên ảnh.

---

#### Slide 14 — ảnh chụp màn hình từng bước

**Cần chuẩn bị:**

- Kịch bản demo: upload file nào, chọn K bao nhiêu, giải thích kết quả ra sao?

---

#### Slide 15 — Kết quả: Đặc điểm từng cụm

**Cần trình bày:**

- Sau khi phân cụm, mỗi nhóm có đặc điểm gì?
- Dựa vào centroid, có thể đặt tên gì cho từng nhóm?
- Nhóm nào thú vị hoặc bất ngờ nhất?

**Gợi ý:** Chạy thử ứng dụng với K=5, xem giá trị centroid thực tế rồi phân tích. Trình bày dạng bảng.

---

#### Slide 16 — Kiến trúc kỹ thuật

**Cần trình bày:**

- Frontend và Backend giao tiếp với nhau như thế nào?
- API endpoint chính là gì?
- Luồng xử lý từ khi nhận request đến khi trả kết quả?

**Gợi ý:** Tham khảo `be/main.py` để xem các endpoint. Vẽ sơ đồ kiến trúc đơn giản.

---

#### Slide 17 — Đánh giá kết quả

**Cần trình bày:**

- Kết quả phân cụm có tốt không? Dựa vào tiêu chí gì?
- K-Means có những hạn chế gì?
- Nếu làm lại, sẽ cải thiện điểm nào?

**Gợi ý:** Thử so sánh kết quả với K=3, K=5, K=7 để thấy sự khác biệt. Nêu cả ưu và nhược điểm một cách trung thực.

---

#### Slide 18 — Ứng dụng kinh doanh

**Cần trình bày:**

- Mỗi nhóm khách hàng nên được tiếp cận bằng chiến lược marketing nào?
- Doanh nghiệp thực tế có thể áp dụng kết quả này như thế nào?

**Gợi ý:** Liên kết trực tiếp với tên nhóm đã đặt ở Slide 15. Tìm thêm ví dụ thực tế từ các công ty lớn.

---

#### Slide 19 — Những gì nhóm học được

**Về mặt kỹ thuật:**

- Hiểu và triển khai được toàn bộ pipeline ML thực tế: từ đọc CSV → chuẩn hóa tên cột → lọc dữ liệu lỗi → StandardScaler → KMeans → PCA → trả kết quả qua API
- Biết cách xây dựng REST API với FastAPI, kết nối với Frontend Next.js qua HTTP POST `/api/cluster`
- Xử lý được các tình huống dữ liệu thực tế: tên cột không thống nhất (income / annual_income / AnnualIncome), dữ liệu số dạng EU (dấu phẩy thập phân), CustomerID trùng lặp
- Dùng PCA để giảm 4 chiều xuống 2D phục vụ trực quan hóa scatter plot

**Về mặt tư duy:**

- Hiểu rằng thuật toán chỉ là một phần nhỏ — phần lớn công việc thực tế nằm ở tiền xử lý dữ liệu
- Học cách đọc kết quả centroid và đặt tên nhóm có ý nghĩa kinh doanh, không chỉ dừng lại ở con số
- Nhận ra tầm quan trọng của việc validate đầu vào: nếu không kiểm tra K > số mẫu, thuật toán sẽ crash

**Khó khăn thực tế gặp phải:**

- Xử lý CORS giữa Frontend (port 3000) và Backend (port 8000) — phải cấu hình middleware đúng
- Dữ liệu CSV từ nhiều nguồn có tên cột khác nhau → phải viết bảng alias để chuẩn hóa
- PCA đôi khi chỉ có 1 component khi dữ liệu quá ít → phải xử lý edge case `n_components = min(2, n_features, n_samples)`

---

#### Slide 20 — Kết luận & Hướng phát triển

**Tóm tắt:**

- Nhóm đã xây dựng thành công hệ thống phân cụm khách hàng end-to-end: Backend Python (FastAPI + scikit-learn) xử lý thuật toán, Frontend Next.js hiển thị kết quả trực quan
- Ứng dụng hỗ trợ upload CSV tùy ý, tự động chuẩn hóa dữ liệu, phân cụm với K tùy chọn, hiển thị scatter plot + elbow chart + bảng kết quả, và xuất file CSV

**Hướng phát triển:**

- Thêm thuật toán DBSCAN để so sánh — phù hợp hơn khi cụm có hình dạng bất thường
- Cho phép upload file Excel (.xlsx) trực tiếp thay vì chỉ CSV
- Thêm tính năng dự đoán nhóm cho khách hàng mới (không cần chạy lại toàn bộ)
- Deploy lên cloud: Vercel (Frontend) + Railway hoặc Render (Backend)

**Lời cảm ơn & Q&A:**

> "Cảm ơn thầy/cô và các bạn đã lắng nghe. Nhóm xin mời câu hỏi."

---

## 📐 GỢI Ý THIẾT KẾ SLIDE (dành cho Người 4 & 5)

- **Font**: Inter hoặc Be Vietnam Pro
- **Màu chủ đạo**: Xanh dương `#2563EB` + Trắng + Xám nhạt
- **Mỗi slide**: Tối đa 5–6 bullet, ưu tiên hình ảnh/biểu đồ hơn chữ
- **Tool**: Google Slides / Canva / PowerPoint
- **Tổng số slide**: 20 slides (~15–18 phút thuyết trình)
- **Lưu ý**: Không tự thêm nội dung — chỉ trình bày đúng theo bản soạn được bàn giao

---

## ❓ CÂU HỎI PHẢN BIỆN THƯỜNG GẶP

> Mỗi người nên tự chuẩn bị câu trả lời cho các câu hỏi liên quan đến phần mình trình bày.

| Câu hỏi                                             | Gợi ý hướng trả lời                                                                        |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Tại sao chọn K-Means mà không dùng thuật toán khác? | Nghĩ về ưu điểm của K-Means so với DBSCAN, Hierarchical — đơn giản, nhanh, dễ diễn giải    |
| Làm sao biết kết quả phân cụm có ý nghĩa?           | Dựa vào Elbow Method và kiểm tra centroid — các nhóm có ý nghĩa kinh doanh không?          |
| Dữ liệu thực tế có khác không?                      | Nghĩ về những vấn đề dữ liệu thực tế thường gặp: missing values, outliers, nhiều chiều hơn |
| K-Means có nhược điểm gì?                           | Tìm hiểu: nhạy cảm với outliers, phải chọn K trước, cụm phi tuyến thì sao?                 |
