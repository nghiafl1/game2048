# 2048 — Hướng dẫn chơi

Đây là bản triển khai trò chơi 2048 bằng HTML/CSS/JavaScript. Mục tiêu đơn giản: ghép các ô có cùng giá trị để tạo ra ô 2048 (hoặc cao hơn) và đạt điểm cao nhất.

## Cách chơi
- Bắt đầu trò chơi bạn sẽ thấy lưới 4x4 (mặc định). Mỗi ô chứa số (2 hoặc 4) hoặc để trống.
- Dùng các phím mũi tên (Arrow keys) để di chuyển các ô theo hướng tương ứng: lên, xuống, trái, phải.
- Khi hai ô cùng giá trị chạm nhau do di chuyển, chúng sẽ gộp lại thành 1 ô có giá trị gấp đôi (ví dụ 2 + 2 = 4). Mỗi ô chỉ có thể gộp một lần trong một lượt.
- Sau mỗi lượt di chuyển hợp lệ, một ô mới (2 hoặc 4) sẽ xuất hiện ngẫu nhiên trên ô trống.
- Trò chơi kết thúc khi không còn nước đi hợp lệ (không ô trống và không có cặp ô liền kề cùng giá trị).

## Giao diện & Nút chức năng
- PLAY: Bắt đầu chơi.
- SETTINGS: Chọn kích thước lưới (3x3, 4x4, 5x5).
- Hint: Hiển thị gợi ý nước đi được đánh giá là tốt nhất; gợi ý sẽ tồn tại tới khi bạn thực hiện một nước đi.
- Undo: Quay lại nước đi trước đó (bộ nhớ undo giới hạn một số bước).
- Restart: Bắt đầu lại ván hiện tại.

Trong chế độ VS (Play with Computer):
- Trận đấu có hẹn giờ (chọn 1/2/3/5 phút).
- Khi bấm Kết thúc, game sẽ hỏi xác nhận và sẽ hiển thị bảng kết quả gồm điểm của bạn, điểm của máy, và thời gian đã chơi.

## Các điều khiển
- Bàn phím: phím mũi tên để di chuyển.
- Trên điện thoại: dùng thao tác vuốt (swipe).
- Các nút trên giao diện: Undo, Hint, Restart, Back, Kết thúc (trong VS).

## Mẹo chơi
- Giữ góc: cố gắng gom các số lớn về một góc và giữ chúng ở đó.
- Tránh làm lộn vị trí các ô lớn: nếu làm rối, bạn dễ bị kẹt.
- Sử dụng Undo & Hint khôn ngoan.

## Tính năng có sẵn
- Single player và VS mode (chơi với máy).
- Animation cho ô mới và gộp.
- Hint với thuật toán expectimax-like để gợi ý nước đi tốt hơn.
- Undo, Restart, Settings cho kích thước lưới.