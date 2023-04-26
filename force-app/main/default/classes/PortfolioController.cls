/**
 * Created by nagendrakumar.singh on 16/04/23.
 */

public without sharing class PortfolioController {

    @AuraEnabled(Cacheable=true)
    public static Portfolio__c fetchPortfolioData() {
        return [
                SELECT
                        AboutMe__c,
                        CertificationData__c,
                        PhoneNumber__c,
                        LinkedInProfile__c,
                        Name,
                        SalesforceStackoverflowProfile__c,
                        StackoverflowData__c,
                        TrailheadProfileURL__c,
                        WhatIAm__c,ResumeURL__c, (
                        SELECT
                                CompanyName__c,
                                JobDescription__c,
                                JobDuration__c,
                                JoiningYear__c,
                                Name,
                                Portfolio__c
                        FROM PortfolioExperiences__r ORDER BY JoiningYear__c
                )
                FROM Portfolio__c
        ];
    }

}