/**
 * 정적 HTML 공통 푸터 — PG 심사·전자상거래 고지용.
 * 상호·주소는 사업자등록증(2026-11-05 발급) 표기와 동일.
 * generate-guides / partners 등에서 import.
 */
export const LEGAL_SITE_FOOTER_HTML = `
      <footer class="legal-footer footer-note" aria-label="사업자·약관">
        <p class="legal-footer-links">
          <a href="/terms/">이용약관</a>
          <span aria-hidden="true"> | </span>
          <a href="/privacy/"><strong>개인정보처리방침</strong></a>
          <span aria-hidden="true"> | </span>
          <a href="/refund/">취소·환불 정책</a>
          <span aria-hidden="true"> | </span>
          <a href="http://pf.kakao.com/_lxhEnn/chat" target="_blank" rel="noopener noreferrer">고객문의</a>
        </p>
        <p>
          상호: 에어픽 공항주차<br />
          서비스명: 에어픽<br />
          대표: 김인원<br />
          사업자등록번호: 776-32-01655 | 통신판매업 신고: 신고 진행 중<br />
          주소: 인천광역시 영종구 자연대로 29, 20층 2017호(중산동, 더스텔라)<br />
          고객센터: <a href="tel:050713285746">0507-1328-5746</a> | 이메일:
          <a href="mailto:ingompunch@gmail.com">ingompunch@gmail.com</a><br />
          개인정보 보호책임자: 김인원 · 대표 · ingompunch@gmail.com<br />
          호스팅 서비스 제공자: Google LLC (Firebase)
        </p>
        <p>
          에어픽은 통신판매중개자로서 주차대행 서비스의 거래 당사자가 아니며,
          입점업체가 제공하는 서비스의 이행 및 책임은 해당 입점업체에 있습니다.
        </p>
        <p>© 에어픽 공항주차. All rights reserved.</p>
      </footer>
`.trim();
