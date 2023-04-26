/**
 * Created by Nagendra on 09-04-2023.
 */

import {LightningElement, wire} from 'lwc';
import backgroundUrl from '@salesforce/resourceUrl/resumebackground';
import profilephoto from '@salesforce/resourceUrl/profilephoto';
import CASE_OBJECT from '@salesforce/schema/Case';
import {NavigationMixin} from "lightning/navigation";
import fetchPortfolioData from '@salesforce/apex/PortfolioController.fetchPortfolioData';

export default class ResumeParentPage extends NavigationMixin(LightningElement) {

    numberofcertifications = 0;
    caseobject = CASE_OBJECT;
    boolSavingCase = false;
    cvUrl;
    name;
    aboutMe = '';
    whatAmI= '';
    lstExperience = [];
    certifications = [];
    stackoverflowProfile;
    linkedinProfile;
    phoneNumber;
    notifyButtonLabel;
    toastBody;

    get boolNotSavingCase(){
        return !this.boolSavingCase;
    }
    get backgroundStyle() {
        return `background:url(${backgroundUrl})` + ' no-repeat center center';
    }

    get fullProfilePhoto() {
        return profilephoto;
    }

    @wire(fetchPortfolioData)
    wiredPortfolioData({ error, data }) {
        if (data) {
            this.aboutMe = data.AboutMe__c;
            this.name = data.Name;
            this.whatAmI = data.WhatIAm__c;
            this.cvUrl = data.ResumeURL__c;
            this.linkedinProfile = data.LinkedInProfile__c;
            this.phoneNumber = data.PhoneNumber__c;
            this.notifyButtonLabel = 'Notify ' + this.name;
            this.toastBody = this.name + ' has been notified successfully.';

            //certification data
            let relatedCertificationStatus = JSON.parse(data.CertificationData__c).data[0].RelatedCertificationStatus.records;
            this.stackoverflowProfile = data.SalesforceStackoverflowProfile__c;

            this.numberofcertifications = relatedCertificationStatus.length;

            for (let i = 0; i < relatedCertificationStatus.length; i++) {
                let eachCertRecord = relatedCertificationStatus[i];
                const certRecord = {
                    certName : eachCertRecord.ExternalCertificationTypeName,
                    certDate : eachCertRecord.CertificationDate,
                    imgURL : eachCertRecord.RelatedCertificationType.Image
                }
                this.certifications.push(certRecord);
            }

            this.startTypeWriter();
            this.lstExperience = data.PortfolioExperiences__r;
        } else if (error) {
            console.log('error -> '+error);
        }
    }

    onsideBarClick() {
        let htmlElement = this.template.querySelector('.navbarSupportedContent');
        if (htmlElement.classList.contains('show')) {
            htmlElement.classList.remove('show')
            htmlElement.classList.remove('collapsing')
        } else {
            htmlElement.classList.add('show')
            htmlElement.classList.add('collapsing')
            setTimeout(() => {
                htmlElement.classList.remove('collapsing')
            }, 500)
        }

    }

    hideNavbarSupportedContent() {
        let htmlElement = this.template.querySelector('.navbarSupportedContent');
        if (htmlElement.classList.contains('show')) {
            htmlElement.classList.remove('show')
            htmlElement.classList.remove('collapsing')
        }
    }

    scrollToSection(targetSelector) {
        const targetSection = this.template.querySelector(targetSelector);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    renderedCallback() {
        this.template.querySelectorAll('nav a.nav-link').forEach((navLink) => {
            navLink.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSelector = navLink.getAttribute('data-target');
                this.scrollToSection(targetSelector);
            });
        });

        this.template.querySelectorAll('.home a.nav-link').forEach((navLink) => {
            navLink.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSelector = navLink.getAttribute('data-target');
                this.scrollToSection(targetSelector);
            });
        });

    }

    connectedCallback() {
        //this.createFile();


        window.addEventListener('scroll', event => {
            const header = this.template.querySelector('.navbar');
            const animatedBoxes = this.template.querySelectorAll(".animated-box");
            const windowOffsetTop = window.innerHeight + window.scrollY;
            const top = window.scrollY
            if (top >= 100) {
                header.classList.add('navbarDark');
            } else {
                header.classList.remove('navbarDark');
            }

            Array.prototype.forEach.call(animatedBoxes, (animatedBox) => {
                const animatedBoxOffsetTop = animatedBox.offsetTop;

                if (windowOffsetTop >= animatedBoxOffsetTop) {
                    this.addClass(animatedBox, "fade-in");
                }
            });
        })


    }

    addClass(element, className) {
        const arrayClasses = element.className.split(" ");
        if (arrayClasses.indexOf(className) === -1) {
            element.className += " " + className;
        }
    }

    handleSuccess(event){
        event.preventDefault();
        console.log('Came To Handle Success');
        console.log(JSON.stringify(event.detail));
        const inputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
        this.boolSavingCase = false;
    }

    handleError(event){
        event.preventDefault();
        console.log('Came To Handle Error');
        console.log(JSON.stringify(event.detail));
        const inputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
        this.boolSavingCase = false;
    }

    handleSubmit(event){
        this.boolSavingCase = true;
        try{
            event.preventDefault();
            const fields = event.detail.fields;
            console.log('fields -> '+JSON.stringify(fields))
            fields.Origin = 'Web';
            this.template.querySelector('lightning-record-edit-form').submit(fields);
            let toastElement = this.template.querySelector('.bstoast');
            if(toastElement.classList.contains('hide')){
                toastElement.classList.remove('hide');
                toastElement.classList.add('show');
                setTimeout(() => {
                    toastElement.classList.remove('show');
                    toastElement.classList.add('hide');
                }, 3000)
            }
        }catch (e) {
            this.boolSavingCase = false;

        } finally {

        }

    }

    handleNavigate(event) {
        let siteURL = '';
        let classList = event.target.classList;
        if(classList && classList.length === 0){
            let closestSVG = event.target.closest('svg');
            classList =  closestSVG.classList;
            console.log('event.closest -> '+classList);
        }
        if(classList.contains('linkedin')){
            siteURL = this.linkedinProfile;
        }
        if(classList.contains('stackexchange')){
            siteURL = this.stackoverflowProfile;
        }
        if(classList.contains('whatsapp')){
            siteURL = 'https://wa.me/'+this.phoneNumber;
        }
        console.log('event.target.classList -> '+classList);
        const config = {
            type: 'standard__webPage',
            attributes: {
                url: siteURL
            }
        };
        console.log('config -> '+JSON.stringify(config));
        this[NavigationMixin.Navigate](config);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async typingEffect(element, speed, text) {
        element.innerHTML = "";
        let i = 0;

        while (i < text.length) {
            element.append(text.charAt(i));
            i++;
            await this.sleep(speed);
        }
    }

    async startTypeWriter() {
        const element = this.template.querySelector(".innerDesc");
        const speed = 50;

        while (true) {
            let strings = this.whatAmI.split(';');

            if(strings.length === 0){
                await this.sleep(2000);
                continue;
            }
            for (let i = 0; i < strings.length; i++) {
                await this.typingEffect(element, speed, strings[i]);
                await this.sleep(2000);
            }
        }
    };

}