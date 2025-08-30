# RBAC and Permissions Architecture

## Overview

Comprehensive Role-Based Access Control (RBAC) framework for the AI Native Liminal Transit platform, covering multi-channel HITM access, end-user permissions, AI agent authorization, and hierarchical permission inheritance from god-level rights down through the entire architecture.

---

## 🏗️ **RBAC Architecture Overview**

### Permission Hierarchy
```yaml
PermissionHierarchy:
  Level0_God:
    roles: ['platform-god', 'system-architect']
    scope: 'Complete platform control'
    capabilities:
      - Infrastructure provisioning/destruction
      - Security policy modification
      - Global configuration changes
      - Emergency override authority
      - Cost ceiling modifications
      - AI model deployment approval
    
  Level1_SuperAdmin:
    roles: ['platform-admin', 'security-admin', 'ai-admin']
    scope: 'Administrative operations'
    capabilities:
      - User role management
      - Environment configuration
      - Security monitoring oversight
      - AI agent orchestration
      - Cost monitoring and alerts
      - Production deployment approval
    
  Level2_Admin:
    roles: ['environment-admin', 'story-admin', 'user-admin']
    scope: 'Domain-specific administration'
    capabilities:
      - Environment-specific management
      - Story content moderation
      - User account management
      - Service configuration
      - Monitoring dashboard access
      - Development environment control
    
  Level3_Developer:
    roles: ['senior-developer', 'ai-engineer', 'devops-engineer']
    scope: 'Development and deployment'
    capabilities:
      - Code repository access
      - CI/CD pipeline management
      - Non-production deployment
      - AI prompt engineering
      - Testing environment access
      - Limited production read access
    
  Level4_Operator:
    roles: ['story-operator', 'content-moderator', 'support-agent']
    scope: 'Operational activities'
    capabilities:
      - Story content management
      - User support operations
      - Monitoring dashboard viewing
      - Basic configuration changes
      - Content moderation tools
      - Support ticket management
    
  Level5_EndUser:
    roles: ['premium-user', 'standard-user', 'trial-user', 'anonymous-user']
    scope: 'Application usage'
    capabilities:
      - Story creation and interaction
      - Personal data management
      - Profile customization
      - Usage analytics viewing
      - Feedback submission
      - Community features

HITMChannels:
  VSCodeExtension:
    authentication: 'GitHub OAuth + MFA'
    authorization: 'Developer+ roles'
    scope: 'Development environment access'
    
  WebDashboard:
    authentication: 'Cognito + MFA'
    authorization: 'Operator+ roles'
    scope: 'Administrative and monitoring functions'
    
  MobileApp:
    authentication: 'Cognito + Biometric'
    authorization: 'All roles with mobile-specific permissions'
    scope: 'Story interaction and basic management'
    
  APIAccess:
    authentication: 'API keys + JWT tokens'
    authorization: 'Programmatic access based on role'
    scope: 'Automated operations and integrations'
```

### Multi-Channel Permission Model
```typescript
interface MultiChannelRBACSystem {
  hitm: {
    vsCode: {
      // Developer channel - VS Code extension
      permissionScopes: {
        codeAccess: 'Repository read/write based on role';
        deploymentControl: 'Environment-specific deployment rights';
        secretsAccess: 'Development secrets only for developers';
        infrastructureView: 'Read-only infrastructure monitoring';
        aiPromptEngineering: 'AI prompt creation and testing';
        costVisibility: 'Development cost tracking';
      };
      
      roleMapping: {
        'platform-god': ['all-permissions'];
        'platform-admin': ['deployment-approval', 'cost-oversight'];
        'senior-developer': ['code-write', 'dev-deploy', 'ai-prompts'];
        'ai-engineer': ['ai-model-access', 'prompt-engineering'];
        'devops-engineer': ['infrastructure-config', 'ci-cd-management'];
      };
    };
    
    dashboard: {
      // Administrative channel - Web dashboard
      permissionScopes: {
        userManagement: 'User role assignment and management';
        systemMonitoring: 'Real-time system health and metrics';
        contentModeration: 'Story and user content oversight';
        securityOverview: 'Security posture and incident management';
        costManagement: 'Budget allocation and cost optimization';
        aiGovernance: 'AI model and prompt governance';
      };
      
      roleMapping: {
        'platform-god': ['global-admin-access'];
        'security-admin': ['security-monitoring', 'incident-response'];
        'story-admin': ['content-moderation', 'story-analytics'];
        'user-admin': ['user-management', 'support-tools'];
        'content-moderator': ['story-review', 'user-reports'];
      };
    };
    
    mobile: {
      // Mobile management channel - Mobile app admin features
      permissionScopes: {
        storyManagement: 'Mobile story creation and editing';
        userSupport: 'Mobile user assistance and troubleshooting';
        contentReview: 'On-the-go content moderation';
        analyticsView: 'Mobile-optimized analytics dashboard';
        emergencyResponse: 'Mobile incident response capabilities';
      };
      
      roleMapping: {
        'platform-admin': ['mobile-emergency-access'];
        'story-admin': ['mobile-story-management'];
        'support-agent': ['mobile-user-support'];
        'content-moderator': ['mobile-content-review'];
      };
    };
  };
  
  endUsers: {
    storyPlayers: {
      // End-user channel - Story players
      permissionScopes: {
        storyCreation: 'Personal story creation and customization';
        storyInteraction: 'Choice selection and narrative progression';
        socialFeatures: 'Story sharing and community interaction';
        personalData: 'Profile management and data export';
        feedback: 'Story rating and feedback submission';
        analytics: 'Personal usage statistics and insights';
      };
      
      roleMapping: {
        'premium-user': ['advanced-story-features', 'priority-support'];
        'standard-user': ['basic-story-features', 'community-access'];
        'trial-user': ['limited-story-features', 'basic-support'];
        'anonymous-user': ['demo-stories-only', 'no-data-persistence'];
      };
    };
    
    creators: {
      // Content creator channel - Story creators
      permissionScopes: {
        contentCreation: 'Advanced story authoring tools';
        publishingControl: 'Story publication and distribution';
        analyticsAccess: 'Story performance metrics and insights';
        monetization: 'Revenue tracking and payment management';
        collaboration: 'Multi-author story development';
      };
      
      roleMapping: {
        'verified-creator': ['publishing-rights', 'monetization-access'];
        'community-creator': ['community-publishing', 'basic-analytics'];
        'aspiring-creator': ['draft-creation', 'feedback-access'];
      };
    };
  };
  
  aiAgents: {
    // AI agent authorization system
    permissionScopes: {
      storyGeneration: 'AI story content creation and modification';
      userInteraction: 'Direct user communication and assistance';
      systemOptimization: 'Performance tuning and resource management';
      securityMonitoring: 'Threat detection and incident response';
      costOptimization: 'Resource allocation and budget management';
    };
    
    agentRoles: {
      'meta-agent': ['global-oversight', 'agent-coordination'];
      'story-agent': ['content-generation', 'narrative-flow'];
      'security-agent': ['threat-monitoring', 'incident-response'];
      'cost-agent': ['resource-optimization', 'budget-tracking'];
      'support-agent': ['user-assistance', 'troubleshooting'];
    };
  };
}
```

---

## 🔐 **Permission Implementation**

### AWS IAM Integration
```typescript
// lib/rbac/aws-iam-integration.ts

export class AWSIAMIntegration {
  private iam: AWS.IAM;
  private sts: AWS.STS;
  private organizations: AWS.Organizations;

  constructor() {
    this.iam = new AWS.IAM();
    this.sts = new AWS.STS();
    this.organizations = new AWS.Organizations();
  }

  // Create hierarchical role structure
  async createRoleHierarchy(): Promise<void> {
    const roleHierarchy = {
      'LiminalTransit-God': {
        policies: ['LiminalTransit-GodPolicy'],
        trustPolicy: this.createTrustPolicy(['platform-architects']),
        maxSessionDuration: 43200, // 12 hours
      },
      'LiminalTransit-SuperAdmin': {
        policies: ['LiminalTransit-SuperAdminPolicy'],
        trustPolicy: this.createTrustPolicy(['platform-admins', 'security-leads']),
        maxSessionDuration: 14400, // 4 hours
      },
      'LiminalTransit-Admin': {
        policies: ['LiminalTransit-AdminPolicy'],
        trustPolicy: this.createTrustPolicy(['environment-admins', 'story-admins']),
        maxSessionDuration: 7200, // 2 hours
      },
      'LiminalTransit-Developer': {
        policies: ['LiminalTransit-DeveloperPolicy'],
        trustPolicy: this.createTrustPolicy(['developers', 'ai-engineers']),
        maxSessionDuration: 3600, // 1 hour
      },
      'LiminalTransit-Operator': {
        policies: ['LiminalTransit-OperatorPolicy'],
        trustPolicy: this.createTrustPolicy(['operators', 'moderators']),
        maxSessionDuration: 3600, // 1 hour
      }
    };

    for (const [roleName, config] of Object.entries(roleHierarchy)) {
      await this.createRole(roleName, config);
    }
  }

  private async createRole(roleName: string, config: any): Promise<void> {
    try {
      await this.iam.createRole({
        RoleName: roleName,
        AssumeRolePolicyDocument: JSON.stringify(config.trustPolicy),
        MaxSessionDuration: config.maxSessionDuration,
        Description: `Hierarchical role for ${roleName.replace('LiminalTransit-', '')} access`,
        Tags: [
          { Key: 'Project', Value: 'LiminalTransit' },
          { Key: 'Type', Value: 'RBAC-Role' },
          { Key: 'Level', Value: this.getRoleLevel(roleName) }
        ]
      }).promise();

      // Attach policies to the role
      for (const policyName of config.policies) {
        await this.attachPolicyToRole(roleName, policyName);
      }

    } catch (error) {
      if (error.code !== 'EntityAlreadyExists') {
        throw error;
      }
      console.log(`Role ${roleName} already exists, updating...`);
    }
  }

  // Create HITM channel-specific policies
  async createChannelPolicies(): Promise<void> {
    const channelPolicies = {
      'LiminalTransit-VSCode-Access': {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'codecommit:GitPull',
              'codecommit:GitPush',
              'codebuild:StartBuild',
              'codepipeline:GetPipeline',
              'lambda:InvokeFunction',
              'dynamodb:Query',
              'dynamodb:Scan'
            ],
            Resource: 'arn:aws:*:*:*:liminal-transit-dev-*',
            Condition: {
              StringEquals: {
                'aws:RequestedRegion': ['us-east-1', 'us-west-2']
              }
            }
          }
        ]
      },

      'LiminalTransit-Dashboard-Access': {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'cloudwatch:GetMetricStatistics',
              'cloudwatch:ListMetrics',
              'cloudwatch:GetDashboard',
              'logs:FilterLogEvents',
              'ec2:DescribeInstances',
              'ecs:DescribeServices',
              'lambda:ListFunctions'
            ],
            Resource: '*',
            Condition: {
              StringLike: {
                'aws:userid': '*:${aws:username}'
              }
            }
          }
        ]
      },

      'LiminalTransit-Mobile-Access': {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'mobiletargeting:GetApp',
              'mobiletargeting:GetCampaign',
              'sns:Publish',
              'dynamodb:GetItem',
              'dynamodb:UpdateItem'
            ],
            Resource: 'arn:aws:*:*:*:liminal-transit-mobile-*'
          }
        ]
      },

      'LiminalTransit-AI-Agent-Access': {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'bedrock:InvokeModel',
              'bedrock:GetFoundationModel',
              'ssm:GetParameter',
              'kms:Decrypt',
              'dynamodb:PutItem',
              'dynamodb:GetItem',
              'dynamodb:UpdateItem',
              'logs:CreateLogStream',
              'logs:PutLogEvents'
            ],
            Resource: [
              'arn:aws:bedrock:*:*:foundation-model/*',
              'arn:aws:ssm:*:*:parameter/liminal-transit/*',
              'arn:aws:kms:*:*:key/*',
              'arn:aws:dynamodb:*:*:table/liminal-transit-*',
              'arn:aws:logs:*:*:log-group:/aws/lambda/liminal-transit-*'
            ]
          }
        ]
      }
    };

    for (const [policyName, policyDocument] of Object.entries(channelPolicies)) {
      await this.createManagedPolicy(policyName, policyDocument);
    }
  }

  // Create fine-grained permissions for end users
  async createEndUserPolicies(): Promise<void> {
    const endUserPolicies = {
      'LiminalTransit-PremiumUser': {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:Query'
            ],
            Resource: 'arn:aws:dynamodb:*:*:table/liminal-transit-stories',
            Condition: {
              ForAllValues:StringEquals: {
                'dynamodb:Attributes': ['story_id', 'user_id', 'content', 'choices', 'created_at']
              },
              StringEquals: {
                'dynamodb:Select': 'SpecificAttributes'
              }
            }
          },
          {
            Effect: 'Allow',
            Action: [
              'lambda:InvokeFunction'
            ],
            Resource: [
              'arn:aws:lambda:*:*:function:liminal-transit-story-generator',
              'arn:aws:lambda:*:*:function:liminal-transit-choice-processor'
            ]
          }
        ]
      },

      'LiminalTransit-StandardUser': {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:GetItem',
              'dynamodb:Query'
            ],
            Resource: 'arn:aws:dynamodb:*:*:table/liminal-transit-stories',
            Condition: {
              StringEquals: {
                'dynamodb:LeadingKeys': ['${cognito-identity.amazonaws.com:sub}']
              }
            }
          }
        ]
      },

      'LiminalTransit-TrialUser': {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:GetItem'
            ],
            Resource: 'arn:aws:dynamodb:*:*:table/liminal-transit-demo-stories',
            Condition: {
              StringEquals: {
                'dynamodb:Select': 'SpecificAttributes'
              },
              'ForAllValues:StringEquals': {
                'dynamodb:Attributes': ['story_id', 'content', 'choices']
              }
            }
          }
        ]
      }
    };

    for (const [policyName, policyDocument] of Object.entries(endUserPolicies)) {
      await this.createManagedPolicy(policyName, policyDocument);
    }
  }

  // Dynamic permission assignment based on context
  async assignContextualPermissions(
    userId: string, 
    context: {
      channel: 'vscode' | 'dashboard' | 'mobile' | 'api';
      environment: 'dev' | 'staging' | 'prod';
      timeWindow: number;
      purpose: string;
    }
  ): Promise<string> {
    // Create temporary role with specific permissions
    const temporaryRole = await this.createTemporaryRole(userId, context);
    
    // Assume role and return credentials
    const assumeRoleResult = await this.sts.assumeRole({
      RoleArn: temporaryRole.arn,
      RoleSessionName: `${userId}-${context.channel}-${Date.now()}`,
      DurationSeconds: Math.min(context.timeWindow, 3600), // Max 1 hour
      Tags: [
        { Key: 'UserId', Value: userId },
        { Key: 'Channel', Value: context.channel },
        { Key: 'Environment', Value: context.environment },
        { Key: 'Purpose', Value: context.purpose }
      ]
    }).promise();

    return assumeRoleResult.Credentials!.SessionToken!;
  }

  private createTrustPolicy(allowedGroups: string[]): any {
    return {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            AWS: `arn:aws:iam::${process.env.AWS_ACCOUNT_ID}:root`
          },
          Action: 'sts:AssumeRole',
          Condition: {
            StringEquals: {
              'saml:group': allowedGroups
            },
            Bool: {
              'aws:MultiFactorAuthPresent': 'true'
            },
            NumericLessThan: {
              'aws:MultiFactorAuthAge': '3600'
            }
          }
        }
      ]
    };
  }

  private async createManagedPolicy(policyName: string, policyDocument: any): Promise<void> {
    try {
      await this.iam.createPolicy({
        PolicyName: policyName,
        PolicyDocument: JSON.stringify(policyDocument),
        Description: `Managed policy for ${policyName.replace('LiminalTransit-', '')}`,
        Tags: [
          { Key: 'Project', Value: 'LiminalTransit' },
          { Key: 'Type', Value: 'RBAC-Policy' }
        ]
      }).promise();
    } catch (error) {
      if (error.code !== 'EntityAlreadyExists') {
        throw error;
      }
    }
  }

  private async attachPolicyToRole(roleName: string, policyName: string): Promise<void> {
    const policyArn = `arn:aws:iam::${process.env.AWS_ACCOUNT_ID}:policy/${policyName}`;
    
    await this.iam.attachRolePolicy({
      RoleName: roleName,
      PolicyArn: policyArn
    }).promise();
  }

  private getRoleLevel(roleName: string): string {
    const levelMap: Record<string, string> = {
      'LiminalTransit-God': '0',
      'LiminalTransit-SuperAdmin': '1',
      'LiminalTransit-Admin': '2',
      'LiminalTransit-Developer': '3',
      'LiminalTransit-Operator': '4'
    };
    return levelMap[roleName] || '5';
  }

  private async createTemporaryRole(userId: string, context: any): Promise<{ arn: string }> {
    // Implementation for creating temporary roles with specific permissions
    const roleName = `LiminalTransit-Temp-${userId}-${Date.now()}`;
    
    // Create temporary role logic here
    return { arn: `arn:aws:iam::${process.env.AWS_ACCOUNT_ID}:role/${roleName}` };
  }
}
```

---

## 🎮 **End-User Permission Model**

### Game Player Permissions
```typescript
interface GamePlayerPermissions {
  // Story interaction permissions
  storyAccess: {
    create: {
      premiumUser: 'Unlimited story creation with advanced features';
      standardUser: '10 stories per month with basic features';
      trialUser: '3 demo stories with limited choices';
      anonymousUser: 'Single demo story, no save capability';
    };
    
    interact: {
      premiumUser: 'Full choice trees, save/load, export options';
      standardUser: 'Basic choice trees, save capability';
      trialUser: 'Linear progression, no save';
      anonymousUser: 'View-only demo experience';
    };
    
    share: {
      premiumUser: 'Public/private sharing, collaboration features';
      standardUser: 'Private sharing with friends';
      trialUser: 'Read-only sharing links';
      anonymousUser: 'No sharing capability';
    };
  };
  
  // Data and privacy permissions
  dataRights: {
    view: 'Personal story history and choices made';
    export: 'JSON/PDF export of personal story data';
    delete: 'Account and story deletion capability';
    portability: 'Data transfer to external platforms';
  };
  
  // Community features
  communityAccess: {
    premiumUser: ['story-rating', 'comment-system', 'creator-tools'];
    standardUser: ['story-rating', 'basic-comments'];
    trialUser: ['view-ratings'];
    anonymousUser: [];
  };
  
  // AI interaction permissions
  aiInteraction: {
    premiumUser: {
      directAIChat: 'Direct conversation with story AI';
      customPrompts: 'Custom story generation prompts';
      aiPersonalization: 'AI learns user preferences';
      advancedGeneration: 'Complex story generation parameters';
    };
    
    standardUser: {
      basicAIInteraction: 'Predefined AI conversation options';
      standardPrompts: 'Template-based story generation';
      basicPersonalization: 'Simple preference learning';
    };
    
    trialUser: {
      demoAIInteraction: 'Limited AI conversation';
      presetPrompts: 'Fixed demo story prompts';
    };
    
    anonymousUser: {
      noAIInteraction: 'No direct AI access';
    };
  };
}
```

### Permission Enforcement
```typescript
// lib/rbac/permission-enforcer.ts

export class PermissionEnforcer {
  private cognitoClient: AWS.CognitoIdentityServiceProvider;
  private dynamodb: AWS.DynamoDB.DocumentClient;

  constructor() {
    this.cognitoClient = new AWS.CognitoIdentityServiceProvider();
    this.dynamodb = new AWS.DynamoDB.DocumentClient();
  }

  // Enforce permissions for story operations
  async enforceStoryPermissions(
    userId: string, 
    operation: 'create' | 'read' | 'update' | 'delete' | 'share',
    storyId?: string
  ): Promise<boolean> {
    const userRole = await this.getUserRole(userId);
    const userTier = await this.getUserTier(userId);
    
    switch (operation) {
      case 'create':
        return await this.checkStoryCreationLimits(userId, userTier);
      
      case 'read':
        return await this.checkStoryReadAccess(userId, storyId!, userRole);
      
      case 'update':
        return await this.checkStoryOwnership(userId, storyId!);
      
      case 'delete':
        return await this.checkStoryOwnership(userId, storyId!) || 
               this.hasModeratorRights(userRole);
      
      case 'share':
        return await this.checkSharingPermissions(userId, userTier, storyId!);
      
      default:
        return false;
    }
  }

  // Check AI interaction permissions
  async enforceAIPermissions(
    userId: string,
    operation: 'generate' | 'chat' | 'customize' | 'analyze'
  ): Promise<{
    allowed: boolean;
    limits: {
      tokensPerHour: number;
      requestsPerMinute: number;
      advancedFeatures: boolean;
    };
  }> {
    const userTier = await this.getUserTier(userId);
    const currentUsage = await this.getCurrentAIUsage(userId);
    
    const tierLimits = {
      premium: {
        tokensPerHour: 100000,
        requestsPerMinute: 60,
        advancedFeatures: true
      },
      standard: {
        tokensPerHour: 10000,
        requestsPerMinute: 10,
        advancedFeatures: false
      },
      trial: {
        tokensPerHour: 1000,
        requestsPerMinute: 2,
        advancedFeatures: false
      },
      anonymous: {
        tokensPerHour: 0,
        requestsPerMinute: 0,
        advancedFeatures: false
      }
    };

    const limits = tierLimits[userTier] || tierLimits.anonymous;
    
    const allowed = this.checkUsageLimits(currentUsage, limits, operation);
    
    return { allowed, limits };
  }

  // Dynamic permission escalation
  async requestPermissionEscalation(
    userId: string,
    requestedPermission: string,
    justification: string,
    duration: number
  ): Promise<{
    approved: boolean;
    temporaryToken?: string;
    expiresAt?: Date;
  }> {
    // Create escalation request
    const escalationRequest = {
      userId,
      requestedPermission,
      justification,
      duration,
      requestedAt: new Date(),
      status: 'pending'
    };

    // Check if auto-approval criteria are met
    if (await this.canAutoApprove(userId, requestedPermission)) {
      const temporaryToken = await this.createTemporaryPermission(
        userId, 
        requestedPermission, 
        duration
      );
      
      return {
        approved: true,
        temporaryToken,
        expiresAt: new Date(Date.now() + duration * 1000)
      };
    }

    // Queue for manual approval
    await this.queueForApproval(escalationRequest);
    
    return { approved: false };
  }

  private async getUserRole(userId: string): Promise<string> {
    try {
      const user = await this.cognitoClient.adminGetUser({
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        Username: userId
      }).promise();

      const roleAttribute = user.UserAttributes?.find(attr => attr.Name === 'custom:role');
      return roleAttribute?.Value || 'standard-user';
    } catch (error) {
      return 'anonymous-user';
    }
  }

  private async getUserTier(userId: string): Promise<'premium' | 'standard' | 'trial' | 'anonymous'> {
    if (!userId) return 'anonymous';
    
    const user = await this.dynamodb.get({
      TableName: process.env.USERS_TABLE_NAME!,
      Key: { user_id: userId }
    }).promise();

    return user.Item?.subscription_tier || 'trial';
  }

  private async checkStoryCreationLimits(userId: string, userTier: string): Promise<boolean> {
    const limits = {
      premium: -1, // Unlimited
      standard: 10, // 10 per month
      trial: 3,     // 3 total
      anonymous: 0  // None
    };

    const limit = limits[userTier] || 0;
    if (limit === -1) return true;
    if (limit === 0) return false;

    const currentCount = await this.getMonthlyStoryCount(userId);
    return currentCount < limit;
  }

  private async checkStoryReadAccess(userId: string, storyId: string, userRole: string): Promise<boolean> {
    const story = await this.dynamodb.get({
      TableName: process.env.STORIES_TABLE_NAME!,
      Key: { story_id: storyId }
    }).promise();

    if (!story.Item) return false;

    // Owner can always read
    if (story.Item.user_id === userId) return true;

    // Public stories can be read by authenticated users
    if (story.Item.visibility === 'public' && userId) return true;

    // Moderators can read all stories
    if (this.hasModeratorRights(userRole)) return true;

    // Shared stories with explicit permission
    if (story.Item.shared_with?.includes(userId)) return true;

    return false;
  }

  private async checkStoryOwnership(userId: string, storyId: string): Promise<boolean> {
    const story = await this.dynamodb.get({
      TableName: process.env.STORIES_TABLE_NAME!,
      Key: { story_id: storyId }
    }).promise();

    return story.Item?.user_id === userId;
  }

  private hasModeratorRights(userRole: string): boolean {
    const moderatorRoles = ['content-moderator', 'story-admin', 'platform-admin', 'platform-god'];
    return moderatorRoles.includes(userRole);
  }

  private async checkSharingPermissions(userId: string, userTier: string, storyId: string): Promise<boolean> {
    const sharingRights = {
      premium: ['public', 'private', 'collaborative'],
      standard: ['private'],
      trial: ['read-only'],
      anonymous: []
    };

    return sharingRights[userTier]?.length > 0 || false;
  }

  private async getCurrentAIUsage(userId: string): Promise<{
    tokensThisHour: number;
    requestsThisMinute: number;
  }> {
    // Implementation to get current AI usage from DynamoDB or Redis
    return {
      tokensThisHour: 0,
      requestsThisMinute: 0
    };
  }

  private checkUsageLimits(currentUsage: any, limits: any, operation: string): boolean {
    if (currentUsage.tokensThisHour >= limits.tokensPerHour) return false;
    if (currentUsage.requestsThisMinute >= limits.requestsPerMinute) return false;
    
    if (operation === 'customize' && !limits.advancedFeatures) return false;
    
    return true;
  }

  private async canAutoApprove(userId: string, requestedPermission: string): Promise<boolean> {
    // Implementation for auto-approval logic
    return false;
  }

  private async createTemporaryPermission(
    userId: string, 
    permission: string, 
    duration: number
  ): Promise<string> {
    // Implementation for creating temporary permission tokens
    return 'temporary-token';
  }

  private async queueForApproval(escalationRequest: any): Promise<void> {
    // Implementation for queuing manual approval requests
  }

  private async getMonthlyStoryCount(userId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await this.dynamodb.query({
      TableName: process.env.STORIES_TABLE_NAME!,
      IndexName: 'user-created-index',
      KeyConditionExpression: 'user_id = :userId AND created_at >= :startOfMonth',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':startOfMonth': startOfMonth.toISOString()
      }
    }).promise();

    return result.Count || 0;
  }
}
```

This comprehensive RBAC framework provides granular permission control across all channels (HITM and end users) while maintaining security and usability from god-level administrative access down to anonymous user interactions.
