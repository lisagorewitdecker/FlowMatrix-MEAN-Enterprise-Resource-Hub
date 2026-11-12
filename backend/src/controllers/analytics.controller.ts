import type { Request, Response } from 'express';
import { Project } from '../models/Project.model';

export const getProjectAnalytics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();

    const [analyticsResult] = await Project.aggregate([
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalProjects: { $sum: 1 },
                totalBudget: { $sum: '$budget' },
                avgBudget: { $avg: '$budget' }
              }
            }
          ],
          statusBreakdown: [
            {
              $group: {
                _id: '$status',
                totalProjects: { $sum: 1 },
                totalBudget: { $sum: '$budget' },
                avgBudget: { $avg: '$budget' }
              }
            },
            { $sort: { totalBudget: -1 } }
          ],
          velocity: [
            {
              $group: {
                _id: null,
                overdueCount: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $lt: ['$deadline', now] },
                          { $ne: ['$status', 'Completed'] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                },
                completedCount: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0]
                  }
                }
              }
            }
          ]
        }
      }
    ]);

    const summaryData = analyticsResult?.summary?.[0] || {
      totalProjects: 0,
      totalBudget: 0,
      avgBudget: 0
    };

    const velocityData = analyticsResult?.velocity?.[0] || {
      overdueCount: 0,
      completedCount: 0
    };

    const totalBudget = summaryData.totalBudget || 1;
    const totalProjects = summaryData.totalProjects || 1;

    const statusBreakdown = (analyticsResult?.statusBreakdown || []).map((item: any) => ({
      _id: item._id,
      totalProjects: item.totalProjects,
      totalBudget: item.totalBudget,
      avgBudget: Math.round(item.avgBudget || 0),
      budgetShare: Math.round((item.totalBudget / totalBudget) * 100),
      projectShare: Math.round((item.totalProjects / totalProjects) * 100)
    }));

    res.status(200).json({
      success: true,
      data: {
        summary: summaryData,
        velocity: {
          ...velocityData,
          completionRate: Math.round((velocityData.completedCount / totalProjects) * 100)
        },
        statusBreakdown
      }
    });
  } catch (error) {
    console.error('Analytics aggregation error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving analytics', error });
  }
};
