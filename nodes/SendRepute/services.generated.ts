// Generated from the customer-only OpenAPI contract. Never edit manually.
export const services = [
  {
    "id": "customerAnalyzeCampaignInsights",
    "title": "Analyze aggregate campaign delivery metrics with AI",
    "method": "POST",
    "path": "/v1/campaign-insights/analyze",
    "fields": [
      {
        "name": "analysisId",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "minLength": 16,
          "maxLength": 128,
          "pattern": "^[A-Za-z0-9_-]{16,128}$"
        }
      },
      {
        "name": "expectedPriceMillicents",
        "location": "body",
        "required": true,
        "schema": {
          "type": "integer",
          "enum": [
            10000,
            5000
          ]
        }
      },
      {
        "name": "consent",
        "location": "body",
        "required": true,
        "schema": {
          "type": "boolean",
          "const": true
        }
      },
      {
        "name": "locale",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "enum": [
            "en",
            "ru",
            "uk",
            "hi",
            "de",
            "fr",
            "es",
            "it",
            "pt",
            "ar",
            "id",
            "tr",
            "zh",
            "vi"
          ],
          "default": "en",
          "description": "Output language; defaults to English."
        }
      },
      {
        "name": "metrics",
        "location": "body",
        "required": true,
        "schema": {
          "type": "object",
          "additionalProperties": false,
          "minProperties": 1,
          "maxProperties": 21,
          "description": "Aggregate counts and percentage rates only; no recipient, campaign, or message-level data.",
          "properties": {
            "sent": {
              "type": "integer",
              "minimum": 0,
              "maximum": 1000000000
            },
            "delivered": {
              "type": "integer",
              "minimum": 0,
              "maximum": 1000000000
            },
            "bounced": {
              "type": "integer",
              "minimum": 0,
              "maximum": 1000000000
            },
            "hardBounced": {
              "type": "integer",
              "minimum": 0,
              "maximum": 1000000000
            },
            "softBounced": {
              "type": "integer",
              "minimum": 0,
              "maximum": 1000000000
            },
            "deferred": {
              "type": "integer",
              "minimum": 0,
              "maximum": 1000000000
            },
            "failed": {
              "type": "integer",
              "minimum": 0,
              "maximum": 1000000000
            },
            "opened": {
              "type": "integer",
              "minimum": 0,
              "maximum": 1000000000
            },
            "uniqueOpened": {
              "type": "integer",
              "minimum": 0,
              "maximum": 1000000000
            },
            "clicked": {
              "type": "integer",
              "minimum": 0,
              "maximum": 1000000000
            },
            "uniqueClicked": {
              "type": "integer",
              "minimum": 0,
              "maximum": 1000000000
            },
            "unsubscribed": {
              "type": "integer",
              "minimum": 0,
              "maximum": 1000000000
            },
            "complaints": {
              "type": "integer",
              "minimum": 0,
              "maximum": 1000000000
            },
            "accepted": {
              "type": "integer",
              "minimum": 0,
              "maximum": 1000000000
            },
            "pending": {
              "type": "integer",
              "minimum": 0,
              "maximum": 1000000000
            },
            "deliveryRate": {
              "type": "number",
              "minimum": 0,
              "maximum": 100
            },
            "openRate": {
              "type": "number",
              "minimum": 0,
              "maximum": 100
            },
            "clickRate": {
              "type": "number",
              "minimum": 0,
              "maximum": 100
            },
            "bounceRate": {
              "type": "number",
              "minimum": 0,
              "maximum": 100
            },
            "unsubscribeRate": {
              "type": "number",
              "minimum": 0,
              "maximum": 100
            },
            "complaintRate": {
              "type": "number",
              "minimum": 0,
              "maximum": 100
            }
          }
        }
      }
    ]
  },
  {
    "id": "customerClassifyEmail",
    "title": "Classify an email using sender name, subject, and body",
    "method": "POST",
    "path": "/v1/classify/edit",
    "fields": [
      {
        "name": "sender",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "minLength": 1,
          "maxLength": 320,
          "description": "Display name of the sender, not an email address."
        }
      },
      {
        "name": "subject",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "minLength": 1,
          "maxLength": 998
        }
      },
      {
        "name": "body",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "minLength": 1,
          "maxLength": 524288,
          "description": "Complete changed body, bounded to 524288 UTF-8 bytes."
        }
      },
      {
        "name": "parentRequestId",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "minLength": 16,
          "maxLength": 128,
          "pattern": "^[A-Za-z0-9_-]+$",
          "description": "Previous analysis request when this request was created by editing flagged terms."
        }
      },
      {
        "name": "editedTerms",
        "location": "body",
        "required": true,
        "schema": {
          "type": "array",
          "maxItems": 10000,
          "description": "Flagged terms changed in this edit; at most 10000 terms of 1–500 characters each and 524288 total characters. Normalized by the server.",
          "items": {
            "type": "string",
            "minLength": 1,
            "maxLength": 500
          }
        }
      },
      {
        "name": "editMode",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "enum": [
            "manual",
            "remove_all"
          ],
          "description": "Required with parentRequestId; determines the authoritative edit charge."
        }
      }
    ]
  },
  {
    "id": "classifyCustomerEmail",
    "title": "Classify one customer email",
    "method": "POST",
    "path": "/v1/classify",
    "fields": [
      {
        "name": "sender",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "minLength": 1,
          "maxLength": 320,
          "description": "Display name of the sender, not an email address."
        }
      },
      {
        "name": "subject",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "minLength": 1,
          "maxLength": 998
        }
      },
      {
        "name": "body",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "minLength": 1,
          "maxLength": 524288
        }
      },
      {
        "name": "displayedAlternatives",
        "location": "body",
        "required": false,
        "schema": {
          "type": "array",
          "minItems": 1,
          "maxItems": 2,
          "description": "All displayed text/plain and text/html alternatives. Each fragment and the required compatibility body are classified independently, with maximum spam risk and combined content audits, in one paid request. Combined UTF-8 size including body must not exceed 524288 bytes. No partial result is returned.",
          "items": {
            "$ref": "#/components/schemas/CustomerDisplayedAlternative"
          }
        }
      },
      {
        "name": "model",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "enum": [
            "thor",
            "theos",
            "athena",
            "odin",
            "freya",
            "hermes",
            "ares",
            "apollo"
          ]
        }
      },
      {
        "name": "priceAuthorization",
        "location": "body",
        "required": false,
        "schema": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "expectedPricing",
            "maxChargeMillicents"
          ],
          "description": "Optional backward-compatible consent for variable term-based pricing. Copy the four effective rates from authenticated GET /v1/pricing and supply the user's authorized per-request ceiling. For new charges, both the current effective rates and actual computed charge are checked atomically at settlement, including membership changes during inference. This does not reserve the ceiling or replace cumulative API-key spending limits. Omission preserves legacy behavior. Authorization is excluded from the content/model fingerprint; an exact completed replay returns its original receipt without a new debit even if authorization or pricing has changed.",
          "properties": {
            "expectedPricing": {
              "$ref": "#/components/schemas/CustomerClassificationExpectedPricing"
            },
            "maxChargeMillicents": {
              "type": "number",
              "multipleOf": 1,
              "minimum": 0,
              "maximum": 9007199254740991,
              "description": "Maximum actual charge authorized for this new classification, in millicents. A lower ceiling is allowed without requiring funds for the maximum possible classification."
            }
          }
        }
      }
    ]
  },
  {
    "id": "customerFinalizeAiRewrite",
    "title": "Confirm exactly one rendered final draft against an owned paid Rewrite All receipt without another debit",
    "method": "POST",
    "path": "/v1/rewrite/finalize",
    "fields": [
      {
        "name": "requestId",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "minLength": 16,
          "maxLength": 128,
          "pattern": "^[A-Za-z0-9_-]+$"
        }
      },
      {
        "name": "sender",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "minLength": 1,
          "maxLength": 320
        }
      },
      {
        "name": "subject",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "minLength": 1,
          "maxLength": 998
        }
      },
      {
        "name": "body",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "minLength": 1,
          "maxLength": 524288
        }
      }
    ]
  },
  {
    "id": "customerCreatePaymentInvoice",
    "title": "Create a USD-denominated Bitcoin deposit invoice",
    "method": "POST",
    "path": "/v1/payments/invoices",
    "fields": [
      {
        "name": "amountCents",
        "location": "body",
        "required": false,
        "schema": {
          "type": "number",
          "multipleOf": 1,
          "minimum": 1000,
          "maximum": 5000000
        }
      },
      {
        "name": "offerId",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "minLength": 1,
          "maxLength": 128
        }
      },
      {
        "name": "purpose",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "enum": [
            "deposit",
            "vip"
          ],
          "default": "deposit"
        }
      },
      {
        "name": "expectedPriceMillicents",
        "location": "body",
        "required": false,
        "schema": {
          "type": "number",
          "multipleOf": 1,
          "minimum": 1
        }
      }
    ]
  },
  {
    "id": "customerCreateHostedBuilderHandoff",
    "title": "Create hosted standard builder handoff",
    "method": "POST",
    "path": "/v1/email-builder/hosted-handoffs",
    "fields": [
      {
        "name": "state",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "maxLength": 64,
          "pattern": "^[a-f0-9]{64}$",
          "description": "Browser-generated nonce relayed by the trusted server."
        }
      },
      {
        "name": "returnOrigin",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "format": "uri",
          "maxLength": 2048,
          "description": "Canonical HTTPS Campaigns origin. This one-use handoff binds the return origin; the API key is not permanently pinned to an origin."
        }
      },
      {
        "name": "initialMjml",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "maxLength": 524288,
          "description": "Optional initial standard-builder source."
        }
      },
      {
        "name": "mode",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "enum": [
            "standard",
            "vip"
          ],
          "default": "standard"
        }
      },
      {
        "name": "vipAccessId",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "maxLength": 200,
          "description": "Owned open VIP native builder access; required only in VIP mode."
        }
      },
      {
        "name": "initialDocument",
        "location": "body",
        "required": false,
        "schema": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "version",
            "title",
            "preheader",
            "lang",
            "direction",
            "width",
            "background",
            "foreground",
            "fontFamily",
            "rows"
          ],
          "properties": {
            "version": {
              "type": "number",
              "const": 1
            },
            "title": {
              "type": "string",
              "maxLength": 500
            },
            "senderName": {
              "type": "string",
              "maxLength": 160,
              "pattern": "^(?!.*(?:@|[<>]|https?://|mailto:))[^\\r\\n]*$"
            },
            "preheader": {
              "type": "string",
              "maxLength": 1000
            },
            "lang": {
              "type": "string",
              "maxLength": 35
            },
            "direction": {
              "type": "string",
              "enum": [
                "ltr",
                "rtl"
              ]
            },
            "width": {
              "type": "number",
              "multipleOf": 1,
              "minimum": 280,
              "maximum": 1200
            },
            "background": {
              "type": "string",
              "maxLength": 32
            },
            "foreground": {
              "type": "string",
              "maxLength": 32
            },
            "fontFamily": {
              "type": "string",
              "maxLength": 200
            },
            "rows": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/CustomerNativeRow"
              },
              "maxItems": 100
            }
          }
        }
      }
    ]
  },
  {
    "id": "customerGetPaidResult",
    "title": "customerGetPaidResult",
    "method": "GET",
    "path": "/customer/paid-results/{recoveryId}",
    "fields": [
      {
        "name": "recoveryId",
        "location": "path",
        "required": true,
        "schema": {
          "type": "string",
          "format": "uuid"
        }
      }
    ]
  },
  {
    "id": "customerPaidResultIdentity",
    "title": "customerPaidResultIdentity",
    "method": "GET",
    "path": "/customer/paid-results/identity",
    "fields": []
  },
  {
    "id": "customerResolvePaidResult",
    "title": "customerResolvePaidResult",
    "method": "POST",
    "path": "/customer/paid-results/{recoveryId}/resolve",
    "fields": [
      {
        "name": "recoveryId",
        "location": "path",
        "required": true,
        "schema": {
          "type": "string",
          "format": "uuid"
        }
      },
      {
        "name": "action",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "enum": [
            "resolve"
          ]
        }
      },
      {
        "name": "reason",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "minLength": 1,
          "maxLength": 500
        }
      }
    ]
  },
  {
    "id": "customerCloseEmailBuilderAccess",
    "title": "DELETE /email-builder/access/{accessId}",
    "method": "DELETE",
    "path": "/v1/email-builder/access/{accessId}",
    "fields": [
      {
        "name": "accessId",
        "location": "path",
        "required": true,
        "schema": {
          "type": "string"
        }
      }
    ]
  },
  {
    "id": "customerDeleteVipEmailBuilderAccess",
    "title": "DELETE /vip/email-builder/access/{accessId}",
    "method": "DELETE",
    "path": "/v1/vip/email-builder/access/{accessId}",
    "fields": [
      {
        "name": "accessId",
        "location": "path",
        "required": true,
        "schema": {
          "type": "string"
        }
      }
    ]
  },
  {
    "id": "customerCreateAiEmailTemplate",
    "title": "Generate an editable email template with AI and charge the account price after validation",
    "method": "POST",
    "path": "/v1/email-builder/ai-template",
    "fields": [
      {
        "name": "expectedPriceMillicents",
        "location": "body",
        "required": false,
        "schema": {
          "type": "number",
          "multipleOf": 1,
          "minimum": 0,
          "description": "Optional quoted effective price. Settlement returns PRICE_CHANGED without charging if current VIP eligibility changes the effective price."
        }
      },
      {
        "name": "content",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "minLength": 1
        }
      },
      {
        "name": "category",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "enum": [
            "newsletter",
            "transactional",
            "personal",
            "business",
            "custom"
          ]
        }
      },
      {
        "name": "subtype",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "enum": [
            "weekly-digest",
            "product-update",
            "promotion",
            "event-invitation",
            "order-confirmation",
            "shipping-update",
            "payment-receipt",
            "password-reset",
            "account-alert",
            "invitation",
            "thank-you",
            "congratulations",
            "personal-update",
            "introduction",
            "announcement",
            "follow-up",
            "meeting-invitation",
            "custom"
          ]
        }
      },
      {
        "name": "recoveryId",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "format": "uuid",
          "description": "Permanent account-scoped paid result identity. Reusing this identifier with changed input returns 409. Preserve it before submitting a paid request."
        }
      }
    ]
  },
  {
    "id": "customerGetEmailBuilderAccess",
    "title": "GET /email-builder/access/{accessId}",
    "method": "GET",
    "path": "/v1/email-builder/access/{accessId}",
    "fields": [
      {
        "name": "accessId",
        "location": "path",
        "required": true,
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "designId",
        "location": "query",
        "required": false,
        "schema": {
          "type": "string"
        }
      }
    ]
  },
  {
    "id": "customerListPaymentMethods",
    "title": "GET /payments/methods",
    "method": "GET",
    "path": "/v1/payments/methods",
    "fields": []
  },
  {
    "id": "customerGetVip",
    "title": "GET /vip",
    "method": "GET",
    "path": "/v1/vip",
    "fields": []
  },
  {
    "id": "customerGetVipEmailBuilderAccess",
    "title": "GET /vip/email-builder/access/{accessId}",
    "method": "GET",
    "path": "/v1/vip/email-builder/access/{accessId}",
    "fields": [
      {
        "name": "accessId",
        "location": "path",
        "required": true,
        "schema": {
          "type": "string"
        }
      }
    ]
  },
  {
    "id": "customerGetPricingSettings",
    "title": "Get current public analysis and editing prices",
    "method": "GET",
    "path": "/v1/pricing",
    "fields": []
  },
  {
    "id": "getCustomerApiUsage",
    "title": "Get customer API usage and limits",
    "method": "GET",
    "path": "/v1/usage",
    "fields": []
  },
  {
    "id": "customerGetStandardBuilderTemplate",
    "title": "Get Standard Builder Template",
    "method": "GET",
    "path": "/v1/email-builder/templates/{templateId}",
    "fields": [
      {
        "name": "templateId",
        "location": "path",
        "required": true,
        "schema": {
          "type": "string",
          "pattern": "^[A-Za-z0-9_-]+$"
        }
      }
    ]
  },
  {
    "id": "customerGetAccount",
    "title": "Get the current account and balance",
    "method": "GET",
    "path": "/v1/account",
    "fields": []
  },
  {
    "id": "customerGetAccountReferrals",
    "title": "Get the current account's referral link and reward activity",
    "method": "GET",
    "path": "/v1/account/referrals",
    "fields": [
      {
        "name": "page",
        "location": "query",
        "required": false,
        "schema": {
          "type": "integer",
          "minimum": 1,
          "default": 1
        }
      },
      {
        "name": "pageSize",
        "location": "query",
        "required": false,
        "schema": {
          "type": "integer",
          "minimum": 1,
          "maximum": 50,
          "default": 20
        }
      }
    ]
  },
  {
    "id": "customerGetVipPlans",
    "title": "Get the current public VIP quote and comparison prices",
    "method": "GET",
    "path": "/v1/vip/plans",
    "fields": []
  },
  {
    "id": "customerGetActiveDepositOffer",
    "title": "Get the currently active Bitcoin deposit bonus offer",
    "method": "GET",
    "path": "/v1/payments/deposit-offer",
    "fields": []
  },
  {
    "id": "customerGetVipBuilderTemplate",
    "title": "Get Vip Builder Template",
    "method": "GET",
    "path": "/v1/vip/email-builder/templates/{templateId}",
    "fields": [
      {
        "name": "templateId",
        "location": "path",
        "required": true,
        "schema": {
          "type": "string",
          "pattern": "^vip-(0[1-9]|1[0-9]|20)$"
        }
      }
    ]
  },
  {
    "id": "customerDeletePaymentInvoice",
    "title": "Hide an unpaid Bitcoin invoice",
    "method": "DELETE",
    "path": "/v1/payments/invoices/{invoiceId}",
    "fields": [
      {
        "name": "invoiceId",
        "location": "path",
        "required": true,
        "schema": {
          "type": "string"
        }
      }
    ]
  },
  {
    "id": "customerListPaymentInvoices",
    "title": "List current account Bitcoin invoices",
    "method": "GET",
    "path": "/v1/payments/invoices",
    "fields": [
      {
        "name": "limit",
        "location": "query",
        "required": false,
        "schema": {
          "type": "number",
          "multipleOf": 1,
          "minimum": 1,
          "maximum": 50,
          "default": 20
        }
      },
      {
        "name": "offset",
        "location": "query",
        "required": false,
        "schema": {
          "type": "number",
          "multipleOf": 1,
          "minimum": 0,
          "default": 0
        }
      }
    ]
  },
  {
    "id": "customerGetCreditLedger",
    "title": "List current account credit ledger",
    "method": "GET",
    "path": "/v1/account/ledger",
    "fields": [
      {
        "name": "kind",
        "location": "query",
        "required": false,
        "schema": {
          "type": "string",
          "enum": [
            "usage",
            "payments"
          ],
          "default": "usage"
        }
      },
      {
        "name": "limit",
        "location": "query",
        "required": false,
        "schema": {
          "type": "number",
          "multipleOf": 1,
          "minimum": 1,
          "maximum": 50,
          "default": 20
        }
      },
      {
        "name": "offset",
        "location": "query",
        "required": false,
        "schema": {
          "type": "number",
          "multipleOf": 1,
          "minimum": 0,
          "default": 0
        }
      }
    ]
  },
  {
    "id": "getCustomerApiModels",
    "title": "List customer API classifier models",
    "method": "GET",
    "path": "/v1/models",
    "fields": []
  },
  {
    "id": "customerListStandardBuilderTemplates",
    "title": "List Standard Builder Templates",
    "method": "GET",
    "path": "/v1/email-builder/templates",
    "fields": []
  },
  {
    "id": "customerListVipBuilderTemplates",
    "title": "List Vip Builder Templates",
    "method": "GET",
    "path": "/v1/vip/email-builder/templates",
    "fields": []
  },
  {
    "id": "customerNativeBuilderCompile",
    "title": "Native Builder Compile",
    "method": "POST",
    "path": "/v1/vip/email-builder/compile",
    "fields": [
      {
        "name": "document",
        "location": "body",
        "required": true,
        "schema": {
          "oneOf": [
            {
              "$ref": "#/components/schemas/CustomerNativeDocument"
            },
            {
              "type": "string",
              "maxLength": 524288,
              "description": "JSON-encoded native document with the exact CustomerNativeDocument shape."
            }
          ],
          "type": "object"
        }
      },
      {
        "name": "accessId",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "maxLength": 200,
          "minLength": 1,
          "description": "Owned, open native VIP access entitlement. Resolved server-side."
        }
      },
      {
        "name": "options",
        "location": "body",
        "required": false,
        "schema": {
          "type": "object",
          "additionalProperties": false,
          "required": [],
          "properties": {
            "cssMode": {
              "type": "string",
              "enum": [
                "inline",
                "head",
                "hybrid"
              ],
              "default": "hybrid"
            },
            "mediaQueries": {
              "type": "boolean",
              "default": true
            },
            "breakpoint": {
              "type": "number",
              "multipleOf": 1,
              "minimum": 280,
              "maximum": 1200,
              "default": 600
            }
          }
        }
      },
      {
        "name": "filename",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "maxLength": 160,
          "pattern": "^[^\\u0000-\\u001f\\u007f/\\\\]*$",
          "description": "Plain filename, not a path; sanitized to a safe HTML filename."
        }
      },
      {
        "name": "format",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "enum": [
            "html",
            "zip"
          ],
          "default": "html",
          "description": "ZIP contains three compiled HTML variants: head-only, hybrid, and inline-only."
        }
      }
    ]
  },
  {
    "id": "customerNativeBuilderExport",
    "title": "Native Builder Export",
    "method": "POST",
    "path": "/v1/vip/email-builder/export",
    "fields": [
      {
        "name": "document",
        "location": "body",
        "required": true,
        "schema": {
          "oneOf": [
            {
              "$ref": "#/components/schemas/CustomerNativeDocument"
            },
            {
              "type": "string",
              "maxLength": 524288,
              "description": "JSON-encoded native document with the exact CustomerNativeDocument shape."
            }
          ],
          "type": "object"
        }
      },
      {
        "name": "accessId",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "maxLength": 200,
          "minLength": 1,
          "description": "Owned, open native VIP access entitlement. Resolved server-side."
        }
      },
      {
        "name": "options",
        "location": "body",
        "required": false,
        "schema": {
          "type": "object",
          "additionalProperties": false,
          "required": [],
          "properties": {
            "cssMode": {
              "type": "string",
              "enum": [
                "inline",
                "head",
                "hybrid"
              ],
              "default": "hybrid"
            },
            "mediaQueries": {
              "type": "boolean",
              "default": true
            },
            "breakpoint": {
              "type": "number",
              "multipleOf": 1,
              "minimum": 280,
              "maximum": 1200,
              "default": 600
            }
          }
        }
      },
      {
        "name": "filename",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "maxLength": 160,
          "pattern": "^[^\\u0000-\\u001f\\u007f/\\\\]*$",
          "description": "Plain filename, not a path; sanitized to a safe HTML filename."
        }
      },
      {
        "name": "format",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "enum": [
            "html",
            "zip"
          ],
          "default": "html",
          "description": "ZIP contains three compiled HTML variants: head-only, hybrid, and inline-only."
        }
      }
    ]
  },
  {
    "id": "customerNativeBuilderImport",
    "title": "Native Builder Import",
    "method": "POST",
    "path": "/v1/vip/email-builder/import",
    "fields": [
      {
        "name": "document",
        "location": "body",
        "required": true,
        "schema": {
          "oneOf": [
            {
              "$ref": "#/components/schemas/CustomerNativeDocument"
            },
            {
              "type": "string",
              "maxLength": 524288,
              "description": "JSON-encoded native document with the exact CustomerNativeDocument shape."
            }
          ],
          "type": "object"
        }
      },
      {
        "name": "accessId",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "maxLength": 200,
          "minLength": 1,
          "description": "Owned, open native VIP access entitlement. Resolved server-side."
        }
      },
      {
        "name": "options",
        "location": "body",
        "required": false,
        "schema": {
          "type": "object",
          "additionalProperties": false,
          "required": [],
          "properties": {
            "cssMode": {
              "type": "string",
              "enum": [
                "inline",
                "head",
                "hybrid"
              ],
              "default": "hybrid"
            },
            "mediaQueries": {
              "type": "boolean",
              "default": true
            },
            "breakpoint": {
              "type": "number",
              "multipleOf": 1,
              "minimum": 280,
              "maximum": 1200,
              "default": 600
            }
          }
        }
      },
      {
        "name": "filename",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "maxLength": 160,
          "pattern": "^[^\\u0000-\\u001f\\u007f/\\\\]*$",
          "description": "Plain filename, not a path; sanitized to a safe HTML filename."
        }
      },
      {
        "name": "format",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "enum": [
            "html",
            "zip"
          ],
          "default": "html",
          "description": "ZIP contains three compiled HTML variants: head-only, hybrid, and inline-only."
        }
      }
    ]
  },
  {
    "id": "customerNativeBuilderValidate",
    "title": "Native Builder Validate",
    "method": "POST",
    "path": "/v1/vip/email-builder/validate",
    "fields": [
      {
        "name": "document",
        "location": "body",
        "required": true,
        "schema": {
          "oneOf": [
            {
              "$ref": "#/components/schemas/CustomerNativeDocument"
            },
            {
              "type": "string",
              "maxLength": 524288,
              "description": "JSON-encoded native document with the exact CustomerNativeDocument shape."
            }
          ],
          "type": "object"
        }
      },
      {
        "name": "accessId",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "maxLength": 200,
          "minLength": 1,
          "description": "Owned, open native VIP access entitlement. Resolved server-side."
        }
      },
      {
        "name": "options",
        "location": "body",
        "required": false,
        "schema": {
          "type": "object",
          "additionalProperties": false,
          "required": [],
          "properties": {
            "cssMode": {
              "type": "string",
              "enum": [
                "inline",
                "head",
                "hybrid"
              ],
              "default": "hybrid"
            },
            "mediaQueries": {
              "type": "boolean",
              "default": true
            },
            "breakpoint": {
              "type": "number",
              "multipleOf": 1,
              "minimum": 280,
              "maximum": 1200,
              "default": 600
            }
          }
        }
      },
      {
        "name": "filename",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "maxLength": 160,
          "pattern": "^[^\\u0000-\\u001f\\u007f/\\\\]*$",
          "description": "Plain filename, not a path; sanitized to a safe HTML filename."
        }
      },
      {
        "name": "format",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "enum": [
            "html",
            "zip"
          ],
          "default": "html",
          "description": "ZIP contains three compiled HTML variants: head-only, hybrid, and inline-only."
        }
      }
    ]
  },
  {
    "id": "customerAccessEmailBuilder",
    "title": "Open a standard email design editor session for free",
    "method": "POST",
    "path": "/v1/email-builder/access",
    "fields": [
      {
        "name": "designId",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        }
      },
      {
        "name": "sourceKind",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "enum": [
            "curated",
            "saved",
            "blank"
          ]
        }
      },
      {
        "name": "templateId",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        }
      }
    ]
  },
  {
    "id": "customerCreateVipEmailBuilderAccess",
    "title": "POST /vip/email-builder/access",
    "method": "POST",
    "path": "/v1/vip/email-builder/access",
    "fields": [
      {
        "name": "designId",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "minLength": 1,
          "maxLength": 128
        }
      },
      {
        "name": "sourceKind",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "enum": [
            "template",
            "blank"
          ]
        }
      },
      {
        "name": "templateId",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "pattern": "^vip-(0[1-9]|1[0-9]|20)$"
        }
      },
      {
        "name": "expectedPriceMillicents",
        "location": "body",
        "required": true,
        "schema": {
          "type": "number",
          "multipleOf": 1,
          "minimum": 0
        }
      },
      {
        "name": "recoveryId",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "format": "uuid",
          "description": "Permanent account-scoped paid result identity. Reusing this identifier with changed input returns 409. Preserve it before submitting a paid request."
        }
      }
    ]
  },
  {
    "id": "customerCreateVipEmailTemplate",
    "title": "POST /vip/email-template",
    "method": "POST",
    "path": "/v1/vip/email-template",
    "fields": [
      {
        "name": "prompt",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "minLength": 1,
          "maxLength": 4000
        }
      },
      {
        "name": "expectedPriceMillicents",
        "location": "body",
        "required": true,
        "schema": {
          "type": "number",
          "multipleOf": 1,
          "minimum": 0
        }
      },
      {
        "name": "imageUrls",
        "location": "body",
        "required": false,
        "schema": {
          "type": "array",
          "maxItems": 8,
          "items": {
            "type": "string",
            "maxLength": 2048,
            "pattern": "^https://"
          }
        }
      },
      {
        "name": "recoveryId",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "format": "uuid",
          "description": "Permanent account-scoped paid result identity. Reusing this identifier with changed input returns 409. Preserve it before submitting a paid request."
        }
      }
    ]
  },
  {
    "id": "customerPurchaseVip",
    "title": "POST /vip/purchase",
    "method": "POST",
    "path": "/v1/vip/purchase",
    "fields": [
      {
        "name": "expectedPriceMillicents",
        "location": "body",
        "required": true,
        "schema": {
          "type": "number",
          "multipleOf": 1,
          "minimum": 1
        }
      }
    ]
  },
  {
    "id": "customerQuoteManualClassificationEdit",
    "title": "Quote an edit and recheck against a saved classification",
    "method": "POST",
    "path": "/v1/classify/edit/quote",
    "fields": [
      {
        "name": "parentRequestId",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "minLength": 16,
          "maxLength": 128,
          "pattern": "^[A-Za-z0-9_-]+$"
        }
      },
      {
        "name": "editMode",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "enum": [
            "manual",
            "remove_all"
          ]
        }
      },
      {
        "name": "terms",
        "location": "body",
        "required": true,
        "schema": {
          "type": "array",
          "maxItems": 10000,
          "items": {
            "type": "string",
            "minLength": 1,
            "maxLength": 500
          }
        }
      }
    ]
  },
  {
    "id": "customerQuoteCampaignInsights",
    "title": "Quote one aggregate campaign insights analysis",
    "method": "POST",
    "path": "/v1/campaign-insights/quote",
    "fields": []
  },
  {
    "id": "customerQuoteAiRewrite",
    "title": "Quote the maximum authorized charge for an AI rewrite",
    "method": "POST",
    "path": "/v1/rewrite/ai-quote",
    "fields": [
      {
        "name": "parentRequestId",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "minLength": 16,
          "maxLength": 128,
          "pattern": "^[A-Za-z0-9_-]+$"
        }
      },
      {
        "name": "mode",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "enum": [
            "single",
            "all"
          ]
        }
      },
      {
        "name": "terms",
        "location": "body",
        "required": true,
        "schema": {
          "type": "array",
          "minItems": 1,
          "maxItems": 1000,
          "items": {
            "type": "string",
            "minLength": 1,
            "maxLength": 500
          }
        }
      }
    ]
  },
  {
    "id": "customerGetAiRewriteResult",
    "title": "Recover an owned completed paid AI rewrite by its original receipt",
    "method": "GET",
    "path": "/v1/rewrite/result/{requestId}",
    "fields": [
      {
        "name": "requestId",
        "location": "path",
        "required": true,
        "schema": {
          "type": "string",
          "minLength": 16,
          "maxLength": 128,
          "pattern": "^[A-Za-z0-9_-]+$"
        }
      }
    ]
  },
  {
    "id": "customerRefreshMyPayments",
    "title": "Refresh confirmations for current account invoices",
    "method": "POST",
    "path": "/v1/payments/refresh",
    "fields": []
  },
  {
    "id": "customerRewriteFlaggedTermsWithAi",
    "title": "Rewrite selected flagged terms with AI and reclassify",
    "method": "POST",
    "path": "/v1/rewrite",
    "fields": [
      {
        "name": "parentRequestId",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "minLength": 16,
          "maxLength": 128,
          "pattern": "^[A-Za-z0-9_-]+$"
        }
      },
      {
        "name": "mode",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "enum": [
            "single",
            "all"
          ]
        }
      },
      {
        "name": "terms",
        "location": "body",
        "required": true,
        "schema": {
          "type": "array",
          "minItems": 1,
          "maxItems": 1000,
          "items": {
            "type": "string",
            "minLength": 1,
            "maxLength": 500
          }
        }
      },
      {
        "name": "priceAuthorization",
        "location": "body",
        "required": false,
        "schema": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "expectedMinimumPerUniqueTermMillicents",
            "maximumChargeMillicents"
          ],
          "properties": {
            "expectedMinimumPerUniqueTermMillicents": {
              "type": "number",
              "multipleOf": 1,
              "minimum": 0,
              "maximum": 10000000
            },
            "maximumChargeMillicents": {
              "type": "number",
              "multipleOf": 1,
              "minimum": 0,
              "maximum": 1000000000
            }
          }
        }
      }
    ]
  },
  {
    "id": "customerStandardBuilderCompile",
    "title": "Standard Builder Compile",
    "method": "POST",
    "path": "/v1/email-builder/compile",
    "fields": [
      {
        "name": "mjml",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "maxLength": 524288,
          "minLength": 1,
          "description": "Complete MJML document; no URL fetching. Entire JSON body must fit 512 KiB and MJML must not exceed 4000 elements."
        }
      },
      {
        "name": "filename",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "maxLength": 160,
          "pattern": "^[^\\u0000-\\u001f\\u007f/\\\\]*$",
          "description": "Plain filename, not a path; sanitized to a safe HTML filename."
        }
      },
      {
        "name": "format",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "enum": [
            "html",
            "mjml",
            "zip"
          ],
          "default": "html",
          "description": "Export representation. ZIP returns a base64 archive with MJML and HTML; no remote assets are downloaded."
        }
      }
    ]
  },
  {
    "id": "customerStandardBuilderExport",
    "title": "Standard Builder Export",
    "method": "POST",
    "path": "/v1/email-builder/export",
    "fields": [
      {
        "name": "mjml",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "maxLength": 524288,
          "minLength": 1,
          "description": "Complete MJML document; no URL fetching. Entire JSON body must fit 512 KiB and MJML must not exceed 4000 elements."
        }
      },
      {
        "name": "filename",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "maxLength": 160,
          "pattern": "^[^\\u0000-\\u001f\\u007f/\\\\]*$",
          "description": "Plain filename, not a path; sanitized to a safe HTML filename."
        }
      },
      {
        "name": "format",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "enum": [
            "html",
            "mjml",
            "zip"
          ],
          "default": "html",
          "description": "Export representation. ZIP returns a base64 archive with MJML and HTML; no remote assets are downloaded."
        }
      }
    ]
  },
  {
    "id": "customerStandardBuilderImport",
    "title": "Standard Builder Import",
    "method": "POST",
    "path": "/v1/email-builder/import",
    "fields": [
      {
        "name": "mjml",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "maxLength": 524288,
          "minLength": 1,
          "description": "Complete MJML document; no URL fetching. Entire JSON body must fit 512 KiB and MJML must not exceed 4000 elements."
        }
      },
      {
        "name": "filename",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "maxLength": 160,
          "pattern": "^[^\\u0000-\\u001f\\u007f/\\\\]*$",
          "description": "Plain filename, not a path; sanitized to a safe HTML filename."
        }
      },
      {
        "name": "format",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "enum": [
            "html",
            "mjml",
            "zip"
          ],
          "default": "html",
          "description": "Export representation. ZIP returns a base64 archive with MJML and HTML; no remote assets are downloaded."
        }
      }
    ]
  },
  {
    "id": "customerStandardBuilderValidate",
    "title": "Standard Builder Validate",
    "method": "POST",
    "path": "/v1/email-builder/validate",
    "fields": [
      {
        "name": "mjml",
        "location": "body",
        "required": true,
        "schema": {
          "type": "string",
          "maxLength": 524288,
          "minLength": 1,
          "description": "Complete MJML document; no URL fetching. Entire JSON body must fit 512 KiB and MJML must not exceed 4000 elements."
        }
      },
      {
        "name": "filename",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "maxLength": 160,
          "pattern": "^[^\\u0000-\\u001f\\u007f/\\\\]*$",
          "description": "Plain filename, not a path; sanitized to a safe HTML filename."
        }
      },
      {
        "name": "format",
        "location": "body",
        "required": false,
        "schema": {
          "type": "string",
          "enum": [
            "html",
            "mjml",
            "zip"
          ],
          "default": "html",
          "description": "Export representation. ZIP returns a base64 archive with MJML and HTML; no remote assets are downloaded."
        }
      }
    ]
  }
] as const;
