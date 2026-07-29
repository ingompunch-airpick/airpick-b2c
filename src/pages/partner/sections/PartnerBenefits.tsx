import {
  CalendarCheck,
  ClipboardList,
  LogIn,
  LogOut,
  MessageCircle,
  Search,
  Star,
  TrendingUp,
} from 'lucide-react';
import { Card, Container, FadeIn, Section, SectionTitle } from '../../../design-system';

const BENEFITS = [
  { icon: Search, title: '비교 페이지 노출', body: '일정·터미널 기준 비교 목록에 올라갑니다.' },
  { icon: CalendarCheck, title: '예약 자동 접수', body: '고객이 에어픽에서 바로 예약합니다.' },
  { icon: ClipboardList, title: '예약 관리', body: '확정·입고·출고 상태를 한눈에 봅니다.' },
  { icon: MessageCircle, title: '카카오 자동 발송', body: '안내 메시지를 반복 입력하지 않습니다.' },
  { icon: LogIn, title: '입고 관리', body: '입고 사진·위치를 고객과 공유합니다.' },
  { icon: LogOut, title: '출고 관리', body: '출고 일정을 고객이 앱에서 확인합니다.' },
  { icon: Star, title: '후기 자동 요청', body: '이용 후 실후기 요청이 이어집니다.' },
  { icon: TrendingUp, title: '리뷰 자산', body: '쌓인 신뢰가 다음 비교·예약을 돕습니다.' },
] as const;

export function PartnerBenefits() {
  return (
    <Section id="benefits" tone="sub">
      <Container>
        <SectionTitle
          align="center"
          className="mb-14"
          title="에어픽 입점 혜택"
          description="비교 노출부터 후기까지, 입점하면 고객과 현장이 한 흐름으로 이어집니다."
        />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.04}>
              <Card hover className="h-full">
                <item.icon className="size-6 text-mkt-brand" aria-hidden />
                <h3 className="mt-4 text-base font-bold text-mkt-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mkt-muted">{item.body}</p>
              </Card>
            </FadeIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}
