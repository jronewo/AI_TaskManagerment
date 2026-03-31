using BusinessObject.DTOs;
using BusinessObject.Models;
using Repository.I_Repository;
using Services.I_Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Services.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepo;

    public NotificationService(INotificationRepository notificationRepo)
    {
        _notificationRepo = notificationRepo;
    }

    public async Task<List<NotificationDto>> GetUserNotificationsAsync(int userId)
    {
        var notifications = await _notificationRepo.GetByUserIdAsync(userId);
        return notifications.Select(n => new NotificationDto
        {
            NotificationId = n.NotificationId,
            UserId = n.UserId,
            Type = n.Type,
            Title = n.Title,
            Message = n.Message,
            ReferenceId = n.ReferenceId,
            ReferenceType = n.ReferenceType,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt
        }).ToList();
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await _notificationRepo.GetUnreadCountAsync(userId);
    }

    public async Task CreateNotificationAsync(CreateNotificationDto dto)
    {
        var notification = new Notification
        {
            UserId = dto.UserId,
            Type = dto.Type,
            Title = dto.Title,
            Message = dto.Message,
            ReferenceId = dto.ReferenceId,
            ReferenceType = dto.ReferenceType,
            IsRead = false,
            CreatedAt = DateTime.Now
        };

        await _notificationRepo.AddAsync(notification);
    }

    public async Task MarkAsReadAsync(int notificationId)
    {
        await _notificationRepo.MarkAsReadAsync(notificationId);
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        await _notificationRepo.MarkAllAsReadAsync(userId);
    }

    public async Task DeleteNotificationAsync(int notificationId)
    {
        await _notificationRepo.DeleteAsync(notificationId);
    }
}
