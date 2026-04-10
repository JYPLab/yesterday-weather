import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-10 text-sm text-gray-800 leading-relaxed max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-1">서비스 이용약관</h1>
      <p className="text-gray-400 mb-8">시행일: 2025년 4월 10일</p>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">제1조 (목적)</h2>
        <p>
          본 약관은 제이케이상사(이하 "회사")이 제공하는 날씨 비교 알림 서비스 "어제보다"(이하 "서비스")의
          이용에 관한 조건 및 절차, 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">제2조 (서비스의 내용)</h2>
        <p className="mb-2">회사는 다음의 서비스를 제공합니다.</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>어제 날씨 대비 오늘 날씨 비교 정보 제공</li>
          <li>기온, 체감온도, 강수 여부, 바람 변화 알림</li>
          <li>사용자 설정 시간에 맞춘 아침 날씨 푸시 알림</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">제3조 (이용자의 의무)</h2>
        <p className="mb-2">이용자는 다음 행위를 하여서는 안 됩니다.</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>서비스를 이용하여 법령 또는 본 약관에 위반되는 행위</li>
          <li>타인의 정보를 도용하거나 허위 정보를 입력하는 행위</li>
          <li>서비스의 정상적인 운영을 방해하는 행위</li>
          <li>회사의 사전 동의 없이 서비스를 영리 목적으로 이용하는 행위</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">제4조 (개인정보 수집 및 이용)</h2>
        <p className="mb-2">회사는 서비스 제공을 위해 아래 최소한의 정보를 수집합니다.</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>설정 지역 (날씨 API 호출 목적)</li>
          <li>알림 수신 시간 (푸시 발송 목적)</li>
          <li>토스 로그인 식별자 (사용자 설정 저장 목적)</li>
        </ul>
        <p className="mt-2">
          수집된 정보는 서비스 제공 외의 목적으로 사용되지 않으며, 민감정보는 수집하지 않습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">제5조 (서비스 이용 제한)</h2>
        <p>
          회사는 이용자가 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해하는 경우
          서비스 이용을 제한할 수 있습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">제6조 (서비스의 변경 및 중단)</h2>
        <p>
          회사는 운영상, 기술상 필요에 따라 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다.
          서비스 중단 시 사전에 공지합니다. 단, 불가피한 사유가 있는 경우 사후 공지할 수 있습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">제7조 (면책조항)</h2>
        <p>
          서비스에서 제공하는 날씨 정보는 기상청 공공 API를 기반으로 하며, 실제 날씨와 차이가 있을 수
          있습니다. 회사는 날씨 정보의 정확성에 대해 보증하지 않으며, 이로 인해 발생한 손해에 대해
          책임을 지지 않습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">제8조 (약관의 변경)</h2>
        <p>
          회사는 필요한 경우 본 약관을 변경할 수 있으며, 변경 시 시행 7일 전에 서비스 내 공지사항을
          통해 고지합니다. 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단할 수 있습니다.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">제9조 (준거법 및 관할)</h2>
        <p>
          본 약관은 대한민국 법률에 따라 해석되며, 서비스 이용으로 발생한 분쟁에 대해서는
          대한민국 법원을 관할로 합니다.
        </p>
      </section>
    </div>
  );
}
