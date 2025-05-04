# Route53 Hosted Zone for firemandecko.com
resource "aws_route53_zone" "primary" {
  name = "firemandecko.com"
  
  tags = {
    Name        = "firemandecko-com-zone"
    Environment = "production"
  }
}

# Output the nameservers assigned by AWS
output "nameservers" {
  value       = aws_route53_zone.primary.name_servers
  description = "The nameservers assigned to the Route53 hosted zone"
}

# A record for apex domain pointing to CloudFront
resource "aws_route53_record" "apex" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "firemandecko.com"
  type    = "A"
  
  alias {
    name                   = aws_cloudfront_distribution.website_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.website_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}


# A record for dollar-game subdomain
resource "aws_route53_record" "dollar_game" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "dollar-game.firemandecko.com"
  type    = "A"
  
  alias {
    name                   = aws_cloudfront_distribution.website_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.website_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

# CNAME record for www.dollar-game subdomain
resource "aws_route53_record" "www_dollar_game" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "www.dollar-game.firemandecko.com"
  type    = "CNAME"
  ttl     = 300
  records = [aws_cloudfront_distribution.website_distribution.domain_name]
}

# MX records for email
resource "aws_route53_record" "mx" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "firemandecko.com"
  type    = "MX"
  ttl     = 3600
  records = [
    "10 mx1.namecheap.com",
    "20 mx2.namecheap.com"
  ]
}

# TXT record for SPF
resource "aws_route53_record" "spf" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "firemandecko.com"
  type    = "TXT"
  ttl     = 3600
  records = ["v=spf1 include:spf.efwd.registrar-servers.com ~all"]
}

# ACM Certificate DNS Validation Records
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = aws_route53_zone.primary.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

# Certificate Validation
resource "aws_acm_certificate_validation" "cert" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}