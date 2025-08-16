# Winky-Coder Architecture Decision Document

## 🎯 **Core Decision: Own Backend Runtime**

**Date:** January 2024  
**Status:** APPROVED  
**Owner:** Winky-Coder Team  

## 📋 **Decision Summary**

Winky-Coder will run on **our own backend infrastructure** by default, not as a thin proxy to Firebase or other third-party BaaS. This ensures we own our code, data, rules, and emulator for privacy, safety, flexibility, and control.

## 🏗️ **Architecture Overview**

### **Core Runtime Components (Our Backend)**
- **Auth Service**: Own sign-in system (email, Google OAuth) with JWT tokens
- **Document Store**: PostgreSQL with JSONB for Firestore-like querying and indexing
- **Storage**: S3-compatible object storage with signed URLs
- **Functions Runner**: Ephemeral container sandbox with limited network access
- **Rules Engine**: Custom policy language with local/prod parity
- **Event System**: Replayable trigger/event queue
- **Emulator**: Local mini-version of all services for testing

### **Optional Adapters (Not Default)**
- Firebase adapter for migration/sync
- AWS adapter for enterprise customers
- Google Cloud adapter for GCP users

## 🔧 **Technical Stack**

### **Backend Services**
```
API Gateway (Express.js + JWT)
├── Auth Service (Passport.js + JWT)
├── Document Store (PostgreSQL + JSONB)
├── Storage Service (MinIO/S3)
├── Functions Runner (Docker containers)
├── Rules Engine (Custom DSL)
├── Event Queue (Redis + Bull)
└── Emulator (Local Docker compose)
```

### **Frontend**
```
React + TypeScript + Vite
├── Monaco Editor (Code editing)
├── Custom UI Components
├── Real-time WebSocket connections
└── Local emulator integration
```

## 🚀 **Text-to-App Prototype Generator**

### **Core Feature**
Users describe apps in plain English → AI generates working prototypes with our backend runtime.

### **Flow**
1. **Input**: Plain English description
2. **Plan**: AI generates structured plan (screens, models, APIs, functions)
3. **Preview**: Visual mockup + file tree + cost estimate
4. **Generate**: Create ephemeral workspace with runnable code
5. **Test**: Run in emulator with live preview
6. **Commit**: Push to Git with tests and documentation

### **Example Prompts**
- "A notes app with email login, markdown editor, tags, and images"
- "E-commerce prototype: products, cart, checkout, admin panel"
- "Chat app with rooms, messages, and push notifications"

## 🔒 **Security & Privacy**

### **Non-Negotiable Rules**
1. **Own Backend**: Core features run on our infrastructure
2. **No Secrets in Prompts**: Service keys never sent to LLMs
3. **Sandbox First**: All AI changes tested in emulator
4. **Human Approval**: Production deploys require manual approval
5. **Audit Logs**: Complete change history and rollback capability

### **Data Protection**
- User data encrypted at rest and in transit
- Secrets stored in HashiCorp Vault
- RBAC with audit logging
- GDPR/CCPA compliance ready

## 📦 **Migration Strategy**

### **From Firebase**
1. **Import**: Upload firebase.json, rules, functions, data
2. **Compatibility Report**: Show what maps cleanly vs. needs fixes
3. **Emulator Test**: Run in our emulator with smoke tests
4. **Staged Switch**: Parallel operation with mirror writes
5. **Export**: Always allow data/config download (no lock-in)

### **To Other Platforms**
- Clear adapter system for optional sync
- Export tools for all major platforms
- Documentation for self-hosting

## 🎯 **Success Criteria**

### **MVP Requirements**
- [x] Core runtime (auth, DB, storage, functions) runs on our infrastructure
- [x] Local emulator matches production behavior
- [x] Text-to-app prototype generator works end-to-end
- [x] Firebase import with compatibility report
- [x] Adapter system for optional external sync
- [x] Secrets kept in vault, never in prompts

### **Phase 2 Goals**
- [ ] Enterprise features (SSO, audit logs, compliance)
- [ ] Advanced AI features (code optimization, security analysis)
- [ ] Multi-tenant architecture
- [ ] Performance optimization and scaling

## 💰 **Cost & Performance**

### **Infrastructure Costs**
- **Development**: ~$200/month (small team)
- **Production**: ~$1000/month (1000 users)
- **Enterprise**: ~$5000/month (unlimited users)

### **Performance Targets**
- **API Response**: <100ms average
- **Function Execution**: <500ms cold start
- **Emulator Startup**: <30 seconds
- **Text-to-App Generation**: <2 minutes

## 🚨 **Risks & Mitigation**

### **Technical Risks**
- **Complexity**: Modular architecture with clear interfaces
- **Performance**: Caching, CDN, database optimization
- **Security**: Regular audits, penetration testing

### **Business Risks**
- **Vendor Lock-in**: Open source core, export tools
- **Compliance**: Built-in audit logs, data residency options
- **Scalability**: Microservices architecture, auto-scaling

## 📅 **Implementation Timeline**

### **Phase 1 (Current)**
- [x] Core backend services
- [x] Emulator implementation
- [x] Text-to-app generator
- [x] Firebase import tools

### **Phase 2 (Next 3 months)**
- [ ] Enterprise features
- [ ] Advanced AI capabilities
- [ ] Performance optimization
- [ ] Multi-tenant support

### **Phase 3 (6 months)**
- [ ] Self-hosting option
- [ ] Advanced integrations
- [ ] Mobile SDK
- [ ] Community features

## 🎉 **Conclusion**

This architecture ensures Winky-Coder remains **our product** with full control over features, data, and destiny. The text-to-app prototype generator makes it magical for users while maintaining our technical independence.

**Decision:** APPROVED ✅  
**Next Review:** March 2024