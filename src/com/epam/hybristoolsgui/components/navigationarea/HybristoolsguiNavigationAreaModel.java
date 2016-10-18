/*
 * [y] hybris Platform
 *
 * Copyright (c) 2000-2016 SAP SE or an SAP affiliate company.
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of SAP
 * ("Confidential Information"). You shall not disclose such Confidential
 * Information and shall use it only in accordance with the terms of the
 * license agreement you entered into with SAP.
 */
package com.epam.hybristoolsgui.components.navigationarea;

import de.hybris.platform.cockpit.components.navigationarea.DefaultNavigationAreaModel;
import de.hybris.platform.cockpit.session.impl.AbstractUINavigationArea;

import com.epam.hybristoolsgui.session.impl.HybristoolsguiNavigationArea;


/**
 * Hybristoolsgui navigation area model.
 */
public class HybristoolsguiNavigationAreaModel extends DefaultNavigationAreaModel
{
	public HybristoolsguiNavigationAreaModel()
	{
		super();
	}

	public HybristoolsguiNavigationAreaModel(final AbstractUINavigationArea area)
	{
		super(area);
	}

	@Override
	public HybristoolsguiNavigationArea getNavigationArea()
	{
		return (HybristoolsguiNavigationArea) super.getNavigationArea();
	}
}
