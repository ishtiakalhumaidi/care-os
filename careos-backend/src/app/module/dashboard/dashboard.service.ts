import status from "http-status";
import AppError from "../../errorHelpers/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { Role } from "../../../generated/prisma/client.js";
import type {
  DashboardPeriod,
  IDashboardResponse,
} from "./dashboard.interface.js";

const getRange = (days = 7) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days);

  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const todayRange = () => getRange(0);

interface IDashboardActor {
  id: string;
  role: Role;
  tenantId?: string | null | undefined;
  branchId?: string | null | undefined;
  classroomId?: string | null | undefined;
}

const buildSuperAdminDashboard = async (
  period: DashboardPeriod,
): Promise<IDashboardResponse> => {
  const days = period === "30d" ? 30 : period === "90d" ? 90 : 7;
  const recent = getRange(days);

  /* ---------- date helpers for MoM ---------- */
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const monthEnds: Date[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    monthEnds.push(d);
  }

  /* ---------- parallel queries ---------- */
  const [
    totalTenants,
    activeTenants,
    suspendedTenants,
    totalUsers,
    totalChildren,
    totalBranches,
    recentTenants,
    recentChildren,
    recentUsers,
    usersByRole,
    childrenByStatus,
    allTenantsWithPlans,
    usersCreatedLast30,
    usersCreated30to60,
    childrenCreatedLast30,
    childrenCreated30to60,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { isActive: true } }),
    prisma.tenant.count({ where: { suspendedAt: { not: null } } }),
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.child.count({ where: { status: { not: "REJECTED" } } }),
    prisma.branch.count({ where: { deletedAt: null } }),
    prisma.tenant.count({ where: { createdAt: { gte: recent.start } } }),
    prisma.child.count({ where: { createdAt: { gte: recent.start } } }),
    prisma.user.count({
      where: { createdAt: { gte: recent.start }, isDeleted: false },
    }),
    prisma.user.groupBy({
      by: ["role"],
      where: { isDeleted: false },
      _count: { id: true },
    }),
    prisma.child.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.tenant.findMany({
      include: { plan: { select: { name: true, price: true } } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo }, isDeleted: false },
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        isDeleted: false,
      },
    }),
    prisma.child.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.child.count({
      where: {
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        status: { not: "REJECTED" },
      },
    }),
  ]);

  /* ---------- MRR ---------- */
  const currentMRR = allTenantsWithPlans
    .filter((t) => t.isActive)
    .reduce((sum, t) => sum + (t.plan?.price ?? 0), 0);

  const tenantsCreatedLast30 = allTenantsWithPlans.filter(
    (t) => t.createdAt >= thirtyDaysAgo,
  );
  const previousMRR =
    currentMRR -
    tenantsCreatedLast30.reduce((sum, t) => sum + (t.plan?.price ?? 0), 0);

  /* ---------- MoM approximations ---------- */
  const previousActiveTenants = activeTenants - tenantsCreatedLast30.length;
  const previousTotalUsers =
    totalUsers - usersCreatedLast30 + usersCreated30to60;
  const previousTotalChildren =
    totalChildren - childrenCreatedLast30 + childrenCreated30to60;

  const calcChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Number((((curr - prev) / prev) * 100).toFixed(1));
  };

  /* ---------- chart data ---------- */
  const mrrHistory = monthEnds.map((start) => {
    const end = new Date(
      start.getFullYear(),
      start.getMonth() + 1,
      0,
      23,
      59,
      59,
    );
    const mrr = allTenantsWithPlans
      .filter(
        (t) =>
          t.createdAt <= end &&
          (t.isActive || (t.suspendedAt && t.suspendedAt > end)),
      )
      .reduce((sum, t) => sum + (t.plan?.price ?? 0), 0);
    return {
      month: start.toLocaleString("default", { month: "short" }),
      value: mrr,
    };
  });

  const tenantSignups = monthEnds.map((start) => {
    const end = new Date(
      start.getFullYear(),
      start.getMonth() + 1,
      0,
      23,
      59,
      59,
    );
    const count = allTenantsWithPlans.filter(
      (t) => t.createdAt >= start && t.createdAt <= end,
    ).length;
    return {
      month: start.toLocaleString("default", { month: "short" }),
      count,
    };
  });

  const tenantsByPlan = allTenantsWithPlans
    .filter((t) => t.isActive)
    .reduce(
      (acc, t) => {
        const name = t.plan?.name ?? "Unknown";
        acc[name] = (acc[name] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

  return {
    role: Role.SUPER_ADMIN,
    period,
    metrics: [
      {
        label: "Monthly Recurring Revenue",
        value: `$${currentMRR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        subtext: "Platform MRR",
      },
      {
        label: "Active Tenants",
        value: activeTenants,
        subtext: `${totalTenants} total`,
      },
      { label: "Platform Users", value: totalUsers },
      { label: "Children on Platform", value: totalChildren },
      { label: "Total Branches", value: totalBranches },
      { label: "Suspended", value: suspendedTenants },
    ],
    alerts:
      suspendedTenants > 0
        ? [
            {
              message: `${suspendedTenants} tenant(s) suspended`,
              type: "warning",
            },
          ]
        : [],
    recents: [
      { label: "New Tenants", count: recentTenants },
      { label: "New Children", count: recentChildren },
      { label: "New Users", count: recentUsers },
    ],
    details: {
      comparisons: {
        mrr: {
          current: currentMRR,
          previous: previousMRR,
          changePercent: calcChange(currentMRR, previousMRR),
        },
        tenants: {
          current: activeTenants,
          previous: previousActiveTenants,
          changePercent: calcChange(activeTenants, previousActiveTenants),
        },
        users: {
          current: totalUsers,
          previous: previousTotalUsers,
          changePercent: calcChange(totalUsers, previousTotalUsers),
        },
        children: {
          current: totalChildren,
          previous: previousTotalChildren,
          changePercent: calcChange(totalChildren, previousTotalChildren),
        },
      },
      charts: { mrrHistory, tenantSignups },
      usersByRole: usersByRole.map((r) => ({
        role: r.role,
        count: r._count.id,
      })),
      childrenByStatus: childrenByStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      tenantsByPlan: Object.entries(tenantsByPlan).map(([plan, count]) => ({
        plan,
        count,
      })),
    },
  };
};

const buildTenantOwnerDashboard = async (
  tenantId: string,
  period: DashboardPeriod,
): Promise<IDashboardResponse> => {
  const days = period === "30d" ? 30 : period === "90d" ? 90 : 7;
  const recent = getRange(days);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const lastMonthStart = new Date(monthStart);
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

  const sixMonthsAgo = new Date(monthStart);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { plan: true },
  });
  if (!tenant) throw new AppError(status.NOT_FOUND, "Tenant not found");

  const [
    branchCount,
    childrenStatus,
    userRoles,
    totalChildren,
    pendingGuardianReqs,
    pendingDocs,
    unpaidInvoices,
    paidThisMonthAgg,
    paidLastMonthAgg,
    recentChildrenCount,
    recentBroadcasts,
    recentPayments,
    recentChildren,
    childrenBeforeLastMonth,
    enrolledBeforeLastMonth,
  ] = await Promise.all([
    prisma.branch.count({ where: { tenantId, deletedAt: null } }),
    prisma.child.groupBy({
      by: ["status"],
      where: { tenantId },
      _count: { id: true },
    }),
    prisma.user.groupBy({
      by: ["role"],
      where: { tenantId, isDeleted: false },
      _count: { id: true },
    }),
    prisma.child.count({
      where: { tenantId, status: { not: "REJECTED" } },
    }),
    prisma.guardianRequest.count({
      where: { child: { tenantId }, status: "PENDING" },
    }),
    prisma.document.count({
      where: { child: { tenantId }, status: "PENDING_SIGNATURE" },
    }),
    prisma.invoice.aggregate({
      where: { child: { tenantId }, status: "UNPAID" },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.payment.aggregate({
      where: {
        invoice: { child: { tenantId } },
        status: "PAID",
        createdAt: { gte: monthStart },
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        invoice: { child: { tenantId } },
        status: "PAID",
        createdAt: { gte: lastMonthStart, lt: monthStart },
      },
      _sum: { amount: true },
    }),
    prisma.child.count({
      where: {
        tenantId,
        createdAt: { lt: lastMonthStart },
        status: { not: "REJECTED" },
      },
    }),
    prisma.broadcast.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, priority: true, createdAt: true },
    }),
    prisma.payment.findMany({
      where: {
        invoice: { child: { tenantId } },
        status: "PAID",
        createdAt: { gte: sixMonthsAgo },
      },
      select: { amount: true, createdAt: true },
    }),
    prisma.child.findMany({
      where: { tenantId, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.child.count({
      where: { tenantId, createdAt: { lt: lastMonthStart } },
    }),
    prisma.child.count({
      where: {
        tenantId,
        status: "ENROLLED",
        approvedAt: { lt: lastMonthStart },
      },
    }),
  ]);

  const enrolled =
    childrenStatus.find((c) => c.status === "ENROLLED")?._count.id ?? 0;
  const paidThisMonth = paidThisMonthAgg._sum.amount ?? 0;
  const paidLastMonth = paidLastMonthAgg._sum.amount ?? 0;

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  /* 6-month revenue history */
  const revenueHistory: { month: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(monthStart);
    start.setMonth(start.getMonth() - i);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const amount = recentPayments
      .filter((p) => p.createdAt >= start && p.createdAt < end)
      .reduce((s, p) => s + p.amount, 0);
    revenueHistory.push({ month: monthNames[start.getMonth()], amount });
  }

  /* 6-month new children */
  const enrollmentGrowth: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(monthStart);
    start.setMonth(start.getMonth() - i);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const count = recentChildren.filter(
      (c) => c.createdAt >= start && c.createdAt < end,
    ).length;
    enrollmentGrowth.push({ month: monthNames[start.getMonth()], count });
  }

  const calcChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Number((((curr - prev) / prev) * 100).toFixed(1));
  };

  return {
    role: Role.TENANT_OWNER,
    period,
    metrics: [
      {
        label: "Paid This Month",
        value: `$${paidThisMonth.toFixed(2)}`,
        subtext: "Tuition collected",
      },
      {
        label: "Outstanding",
        value: `$${(unpaidInvoices._sum.amount ?? 0).toFixed(2)}`,
        subtext: `${unpaidInvoices._count.id} unpaid invoice(s)`,
      },
      {
        label: "Children",
        value: totalChildren,
        subtext: `Limit: ${tenant.plan?.maxStudents ?? "—"}`,
      },
      { label: "Enrolled", value: enrolled },
      {
        label: "Branches",
        value: branchCount,
        subtext: `Limit: ${tenant.plan?.maxBranches ?? "—"}`,
      },
      { label: "Pending Requests", value: pendingGuardianReqs },
    ],
    alerts: [
      ...(unpaidInvoices._count.id > 0
        ? [
            {
              message: `${unpaidInvoices._count.id} unpaid invoice(s)`,
              type: "warning" as const,
            },
          ]
        : []),
      ...(pendingDocs > 0
        ? [
            {
              message: `${pendingDocs} document(s) awaiting signature`,
              type: "info" as const,
            },
          ]
        : []),
      ...(pendingGuardianReqs > 0
        ? [
            {
              message: `${pendingGuardianReqs} guardian request(s) pending`,
              type: "info" as const,
            },
          ]
        : []),
    ],
    recents: [{ label: "New Children", count: recentChildrenCount }],
    details: {
      childrenByStatus: childrenStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      staffByRole: userRoles.map((r) => ({ role: r.role, count: r._count.id })),
      recentBroadcasts,
      comparisons: {
        revenue: {
          current: paidThisMonth,
          previous: paidLastMonth,
          changePercent: calcChange(paidThisMonth, paidLastMonth),
        },
        children: {
          current: totalChildren,
          previous: childrenBeforeLastMonth,
          changePercent: calcChange(totalChildren, childrenBeforeLastMonth),
        },
        enrolled: {
          current: enrolled,
          previous: enrolledBeforeLastMonth,
          changePercent: calcChange(enrolled, enrolledBeforeLastMonth),
        },
      },
      charts: { revenueHistory, enrollmentGrowth },
      planLimits: {
        maxStudents: tenant.plan?.maxStudents ?? null,
        maxBranches: tenant.plan?.maxBranches ?? null,
        currentStudents: totalChildren,
        currentBranches: branchCount,
      },
    },
  };
};

const buildCenterAdminDashboard = async (
  branchId: string,
  tenantId: string,
  period: DashboardPeriod,
): Promise<IDashboardResponse> => {
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { isActive: true, deletedAt: true },
  });
  if (!branch || branch.deletedAt || !branch.isActive) {
    throw new AppError(status.FORBIDDEN, "Branch is no longer active");
  }

  const days = period === "30d" ? 30 : period === "90d" ? 90 : 7;
  const recent = getRange(days);
  const { start: tStart, end: tEnd } = todayRange();

  const [
    classroomCount,
    totalChildren,
    childrenStatus,
    attendanceToday,
    recentCheckins,
    pendingGuardianReqs,
    pendingDocs,
    recentEvents,
    staffCount,
  ] = await Promise.all([
    prisma.classroom.count({ where: { branchId } }),
    prisma.child.count({ where: { branchId, status: { not: "REJECTED" } } }),
    prisma.child.groupBy({
      by: ["status"],
      where: { branchId },
      _count: { id: true },
    }),
    prisma.attendance.groupBy({
      by: ["status"],
      where: { child: { branchId }, createdAt: { gte: tStart, lte: tEnd } },
      _count: { id: true },
    }),
    prisma.attendance.findMany({
      where: {
        child: { branchId },
        checkInTime: { not: null },
        createdAt: { gte: tStart },
      },
      orderBy: { checkInTime: "desc" },
      take: 5,
      select: {
        id: true,
        checkInTime: true,
        status: true,
        child: { select: { firstName: true, lastName: true, photoUrl: true } },
      },
    }),
    prisma.guardianRequest.count({
      where: { child: { branchId }, status: "PENDING" },
    }),
    prisma.document.count({
      where: { child: { branchId }, status: "PENDING_SIGNATURE" },
    }),
    prisma.timelineEvent.findMany({
      where: { child: { branchId } },
      orderBy: { loggedAt: "desc" },
      take: 5,
      select: {
        id: true,
        eventType: true,
        description: true,
        loggedAt: true,
        child: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.user.count({ where: { branchId, isDeleted: false } }),
  ]);

  const checkedInCount =
    attendanceToday.find((a) => a.status === "CHECKED_IN")?._count.id ?? 0;
  const checkedOutCount =
    attendanceToday.find((a) => a.status === "CHECKED_OUT")?._count.id ?? 0;

  const pendingCount = totalChildren - checkedInCount - checkedOutCount;

  return {
    role: Role.CENTER_ADMIN,
    period,
    metrics: [
      { label: "Classrooms", value: classroomCount },
      { label: "Children", value: totalChildren },
      { label: "Checked In Today", value: checkedInCount },
      { label: "Checked Out Today", value: checkedOutCount },
      { label: "Pending Check-in", value: pendingCount },
      { label: "Staff", value: staffCount },
    ],
    alerts: [
      ...(pendingCount > 0
        ? [
            {
              message: `${pendingCount} child(ren) not yet checked in`,
              type: "warning" as const,
            },
          ]
        : []),
      ...(pendingGuardianReqs > 0
        ? [
            {
              message: `${pendingGuardianReqs} guardian request(s) pending`,
              type: "info" as const,
            },
          ]
        : []),
    ],
    recents: [],
    details: {
      childrenByStatus: childrenStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      recentCheckins,
      recentTimelineEvents: recentEvents,
    },
  };
};

const buildTeacherDashboard = async (
  userId: string,
  branchId: string,
  tenantId: string,
  period: DashboardPeriod,
): Promise<IDashboardResponse> => {
  const { start: tStart } = todayRange();

  const assignments = await prisma.classroomTeacher.findMany({
    where: {
      teacherId: userId,
      classroom: {
        branch: { isActive: true, deletedAt: null }, // ← FIX
      },
    },
    include: {
      classroom: {
        select: {
          id: true,
          name: true,
          legalCapacity: true,
          _count: { select: { children: true } },
        },
      },
    },
  });

  const classroomIds = assignments.map((a) => a.classroomId);
  const childIds = (
    await prisma.child.findMany({
      where: { classroomId: { in: classroomIds }, status: "ENROLLED" },
      select: { id: true },
    })
  ).map((c) => c.id);

  const [attendanceToday, recentEvents, pendingDocs, recentMessages] =
    await Promise.all([
      prisma.attendance.groupBy({
        by: ["status"],
        where: { childId: { in: childIds }, createdAt: { gte: tStart } },
        _count: { id: true },
      }),
      prisma.timelineEvent.findMany({
        where: { childId: { in: childIds } },
        orderBy: { loggedAt: "desc" },
        take: 8,
        select: {
          id: true,
          eventType: true,
          description: true,
          loggedAt: true,
          child: {
            select: { firstName: true, lastName: true, photoUrl: true },
          },
        },
      }),
      prisma.document.count({
        where: { childId: { in: childIds }, status: "PENDING_SIGNATURE" },
      }),
      prisma.message.findMany({
        where: {
          conversation: {
            OR: [
              { classroomId: { in: classroomIds } },
              { childId: { in: childIds } },
            ],
            participants: { some: { id: userId } },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          content: true,
          createdAt: true,
          sender: { select: { name: true, image: true } },
          conversation: { select: { id: true, isDirectMessage: true } },
        },
      }),
    ]);

  const checkedIn =
    attendanceToday.find((a) => a.status === "CHECKED_IN")?._count.id ?? 0;
  const checkedOut =
    attendanceToday.find((a) => a.status === "CHECKED_OUT")?._count.id ?? 0;

  const notIn = childIds.length - checkedIn - checkedOut;

  return {
    role: Role.TEACHER,
    period,
    metrics: [
      { label: "My Classrooms", value: assignments.length },
      { label: "Total Children", value: childIds.length },
      { label: "Checked In Today", value: checkedIn },
      { label: "Not Checked In", value: notIn },
      { label: "Pending Documents", value: pendingDocs },
    ],
    alerts:
      notIn > 0
        ? [
            {
              message: `${notIn} child(ren) still pending check-in`,
              type: "warning",
            },
          ]
        : [],
    recents: [],
    details: {
      classrooms: assignments.map((a) => ({
        id: a.classroom.id,
        name: a.classroom.name,
        childCount: a.classroom._count.children,
        legalCapacity: a.classroom.legalCapacity,
        isLead: a.isLead,
      })),
      recentTimelineEvents: recentEvents,
      recentMessages,
    },
  };
};

const buildGuardianDashboard = async (
  userId: string,
  tenantId: string | null | undefined,
  period: DashboardPeriod,
): Promise<IDashboardResponse> => {
  const { start: tStart } = todayRange();

  const links = await prisma.childGuardian.findMany({
    where: {
      userId,
      child: {
        branch: { isActive: true, deletedAt: null }, 
      },
    },
    include: {
      child: {
        include: {
          branch: { select: { id: true, name: true } },
          classroom: { select: { id: true, name: true } },
          attendance: {
            where: { createdAt: { gte: tStart } },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          documents: {
            where: { status: "PENDING_SIGNATURE" },
            select: { id: true, type: true, fileUrl: true },
          },
          invoices: {
            where: { status: "UNPAID" },
            select: { id: true, amount: true, dueDate: true, status: true },
          },
          timelineEvents: { orderBy: { loggedAt: "desc" }, take: 3 },
        },
      },
    },
  });

  const myChildren = links.map((l) => l.child);
  const branchIds = [
    ...new Set(myChildren.map((c) => c.branchId).filter(Boolean)),
  ] as string[];
  const classroomIds = [
    ...new Set(myChildren.map((c) => c.classroomId).filter(Boolean)),
  ] as string[];

  const [broadcasts, unreadConversations] = await Promise.all([
    prisma.broadcast.findMany({
      where: {
        OR: [
          ...(tenantId ? [{ tenantId, audience: "TENANT" as const }] : []),
          { branchId: { in: branchIds }, audience: "BRANCH" as const },
          { classroomId: { in: classroomIds }, audience: "CLASSROOM" as const },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        body: true,
        priority: true,
        createdAt: true,
      },
    }),
    prisma.conversation.findMany({
      where: {
        OR: [
          { childId: { in: myChildren.map((c) => c.id) } },
          { classroomId: { in: classroomIds } },
        ],
        participants: { some: { id: userId } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        isDirectMessage: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, createdAt: true },
        },
      },
    }),
  ]);

  const activeAndPendingChildren = myChildren.filter((child) => child.status !== "REJECTED");

  const totalUnpaid = activeAndPendingChildren.reduce(
    (sum, child) => sum + child.invoices.reduce((s, inv) => s + inv.amount, 0),
    0,
  );
  
  const totalPendingDocs = activeAndPendingChildren.reduce(
    (sum, child) => sum + child.documents.length,
    0,
  );

  const formattedChildren = myChildren.map((c) => ({
    id: c.id,
    childCode: c.childCode,
    name: `${c.firstName} ${c.lastName}`,
    photoUrl: c.photoUrl,
    status: c.status,
    classroom: c.classroom?.name ?? null,
    todayAttendance: c.attendance[0]?.status ?? "PENDING_CHECKIN",
    pendingDocsCount: c.documents.length,
    unpaidTotal: c.invoices.reduce((s, i) => s + i.amount, 0),
  }));

  const categorizedChildren = {
    pending: formattedChildren.filter((c) => c.status === "APPLIED" || c.status === "WAITLISTED"),
    enrolled: formattedChildren.filter((c) => c.status === "ENROLLED"),
    suspended: formattedChildren.filter((c) => c.status === "SUSPENDED"),
    rejected: formattedChildren.filter((c) => c.status === "REJECTED"),
  };

  return {
    role: Role.GUARDIAN,
    period,
    metrics: [
      { label: "My Children", value: activeAndPendingChildren.length },
      { label: "Unpaid Invoices", value: `$${totalUnpaid.toFixed(2)}` },
      { label: "Documents to Sign", value: totalPendingDocs },
    ],
    alerts:
      totalUnpaid > 0
        ? [
            {
              message: `You have $${totalUnpaid.toFixed(2)} in outstanding invoices`,
              type: "warning",
            },
          ]
        : [],
    recents: [],
    details: {
      children: categorizedChildren,
      broadcasts,
      conversations: unreadConversations,
    },
  };
};

const getDashboard = async (
  user: IDashboardActor,
  period: DashboardPeriod,
): Promise<IDashboardResponse> => {
  switch (user.role) {
    case Role.SUPER_ADMIN:
      return buildSuperAdminDashboard(period);
    case Role.TENANT_OWNER:
      if (!user.tenantId)
        throw new AppError(status.BAD_REQUEST, "Tenant not assigned");
      return buildTenantOwnerDashboard(user.tenantId, period);
    case Role.CENTER_ADMIN:
      if (!user.branchId)
        throw new AppError(status.BAD_REQUEST, "Branch not assigned");
      return buildCenterAdminDashboard(
        user.branchId,
        user.tenantId ?? "",
        period,
      );
    case Role.TEACHER:
      if (!user.branchId)
        throw new AppError(status.BAD_REQUEST, "Branch not assigned");
      return buildTeacherDashboard(
        user.id,
        user.branchId,
        user.tenantId ?? "",
        period,
      );
    case Role.GUARDIAN:
      return buildGuardianDashboard(user.id, user.tenantId, period);
    default:
      throw new AppError(
        status.FORBIDDEN,
        "Dashboard not available for this role",
      );
  }
};

export const DashboardService = { getDashboard };
