import { User } from "@/hooks/use-user-api"

export type UserRole = "local_contact" | "coach" | "administrator"
export type UserStatus = "active" | "suspended" | "pending"
export type VideoStatus = "pending" | "published" | "flagged" | "removed"
export type CommentStatus = "pending" | "approved" | "flagged" | "removed"

export interface PermissionContext {
  user: User
  resourceOwnerId?: number
  resourceStatus?: VideoStatus | CommentStatus
  isResourceOwner?: boolean
  isEvaluator?: boolean
  isAuthor?: boolean
}

export class PermissionManager {
  static canAccessEndpoint(endpoint: string, context: PermissionContext): boolean {
    const { user } = context
    
    // Check if user is active
    if (user.status !== "active") {
      return false
    }

    switch (endpoint) {
      // Auth endpoints - all roles can access
      case "auth.register":
      case "auth.login":
      case "auth.refresh":
      case "auth.logout":
        return true

      // User profile - all roles can access their own profile
      case "users.me.get":
      case "users.me.update":
      case "users.me.password":
      case "users.me.email":
        return true

      // User management - admin only
      case "users.list":
      case "users.get":
      case "users.delete":
      case "users.status":
      case "users.password.admin":
      case "users.email.admin":
        return user.role === "administrator"

      // Athlete management - coaches and admins
      case "athletes.create":
      case "athletes.update":
      case "athletes.delete":
        return user.role === "coach" || user.role === "administrator"

      // Athlete read - all roles
      case "athletes.list":
      case "athletes.get":
      case "athletes.stats":
        return true

      // Video upload - all roles (with restrictions)
      case "videos.upload":
        return true

      // Video read - all roles for published videos
      case "videos.list":
        return true

      // Video read by ID - depends on ownership and status
      case "videos.get":
        return this.canViewVideo(context)

      // Video update/delete - depends on ownership
      case "videos.update":
      case "videos.delete":
        return this.canModifyVideo(context)

      // Video status - admin only
      case "videos.status":
        return user.role === "administrator"

      // Evaluation management - coaches and admins
      case "evaluations.create":
        return user.role === "coach" || user.role === "administrator"

      // Evaluation read/update/delete - depends on evaluator
      case "evaluations.get":
      case "evaluations.update":
      case "evaluations.delete":
        return this.canModifyEvaluation(context)

      // Evaluation list - coaches and admins
      case "evaluations.list":
      case "evaluations.athlete":
        return user.role === "coach" || user.role === "administrator"

      // All evaluations - coaches and admins
      case "evaluations.all":
        return user.role === "coach" || user.role === "administrator"

      // Comment create - if can view video
      case "comments.create":
        return this.canViewVideo(context)

      // Comment read - if can view video
      case "comments.get":
      case "comments.list":
        return this.canViewVideo(context)

      // Comment update/delete - if author
      case "comments.update":
      case "comments.delete":
        return this.canModifyComment(context)

      // Comment moderation - admin only
      case "comments.status":
      case "comments.all":
      case "comments.pending":
        return user.role === "administrator"

      default:
        return false
    }
  }

  private static canViewVideo(context: PermissionContext): boolean {
    const { user, resourceStatus, isResourceOwner } = context
    
    // Admins can view all videos
    if (user.role === "administrator") {
      return true
    }

    // Coaches can view all videos
    if (user.role === "coach") {
      return true
    }

    // Local contacts can view published videos or their own videos
    if (user.role === "local_contact") {
      return resourceStatus === "published" || isResourceOwner === true
    }

    return false
  }

  private static canModifyVideo(context: PermissionContext): boolean {
    const { user, isResourceOwner } = context
    
    // Admins can modify all videos
    if (user.role === "administrator") {
      return true
    }

    // Coaches can modify videos they own or are associated with
    if (user.role === "coach") {
      return isResourceOwner === true
    }

    // Local contacts can only modify their own videos
    if (user.role === "local_contact") {
      return isResourceOwner === true
    }

    return false
  }

  private static canModifyEvaluation(context: PermissionContext): boolean {
    const { user, isEvaluator } = context
    
    // Admins can modify all evaluations
    if (user.role === "administrator") {
      return true
    }

    // Coaches can only modify their own evaluations
    if (user.role === "coach") {
      return isEvaluator === true
    }

    return false
  }

  private static canModifyComment(context: PermissionContext): boolean {
    const { user, isAuthor } = context
    
    // Admins can modify all comments
    if (user.role === "administrator") {
      return true
    }

    // Coaches can modify their own comments
    if (user.role === "coach") {
      return isAuthor === true
    }

    // Local contacts can only modify their own comments
    if (user.role === "local_contact") {
      return isAuthor === true
    }

    return false
  }

  // Helper methods for common permission checks
  static canManageUsers(user: User): boolean {
    return user.role === "administrator"
  }

  static canManageAthletes(user: User): boolean {
    return user.role === "coach" || user.role === "administrator"
  }

  static canUploadVideos(user: User): boolean {
    return user.status === "active"
  }

  static canCreateEvaluations(user: User): boolean {
    return user.role === "coach" || user.role === "administrator"
  }

  static canModerateContent(user: User): boolean {
    return user.role === "administrator"
  }

  static canViewAllVideos(user: User): boolean {
    return user.role === "coach" || user.role === "administrator"
  }

  static canViewAllEvaluations(user: User): boolean {
    return user.role === "coach" || user.role === "administrator"
  }

  // Check if user can see other administrators in user management
  static canSeeOtherAdmins(user: User): boolean {
    // Only super admins or system administrators should see other admins
    // For now, we'll hide other admins from all admin users
    return false
  }

  // Check if user can manage other administrators
  static canManageOtherAdmins(user: User): boolean {
    // Only super admins should manage other admins
    // For now, we'll prevent all admins from managing other admins
    return false
  }
}

// Hook for easy permission checking in components
export function usePermissions(user: User) {
  return {
    canManageUsers: () => PermissionManager.canManageUsers(user),
    canManageAthletes: () => PermissionManager.canManageAthletes(user),
    canUploadVideos: () => PermissionManager.canUploadVideos(user),
    canCreateEvaluations: () => PermissionManager.canCreateEvaluations(user),
    canModerateContent: () => PermissionManager.canModerateContent(user),
    canViewAllVideos: () => PermissionManager.canViewAllVideos(user),
    canViewAllEvaluations: () => PermissionManager.canViewAllEvaluations(user),
    canSeeOtherAdmins: () => PermissionManager.canSeeOtherAdmins(user),
    canManageOtherAdmins: () => PermissionManager.canManageOtherAdmins(user),
    canAccessEndpoint: (endpoint: string, context: Omit<PermissionContext, "user">) => 
      PermissionManager.canAccessEndpoint(endpoint, { ...context, user }),
  }
} 